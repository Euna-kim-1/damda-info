import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  useMap,
  ZoomControl,
} from 'react-leaflet';
import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import {
  Box,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { apiGet } from '../../../shared/api/client';
import {
  createStoreMarkerIcons,
  getStoreMarkerIcon,
} from '../../../shared/ui/store/StoreMapIcons';
import PrimaryButton from '../../../shared/ui/buttons/PrimaryButton';
import LoadingState from '../../../shared/ui/LoadingState';
import NearMeIcon from '@mui/icons-material/NearMe';

const FitToStores = ({ stores, padding }) => {
  const map = useMap();

  useEffect(() => {
    if (!stores?.length) return;

    const bounds = L.latLngBounds(
      stores.map((s) => [Number(s.lat), Number(s.lng)]),
    );
    map.fitBounds(bounds, { padding });
  }, [map, stores, padding]);

  return null;
};

const haversineKm = (a, b) => {
  const R = 6371; // km
  const toRad = (d) => (d * Math.PI) / 180;

  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(h));
};

const StoresMapView = ({
  height = 220,
  scrollWheelZoom = false,
  fitPadding = [20, 20],
  showPopups = false,
  showLoading = true,
  enableMyLocationFeatures = false,
}) => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  const [myPos, setMyPos] = useState(null); // { lat, lng }
  const [geoError, setGeoError] = useState(null);

  const storeIcons = useMemo(() => createStoreMarkerIcons(), []);

  const myLocationIcon = useMemo(
    () =>
      L.divIcon({
        className: '',
        html: `
          <div style="
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: #1976d2;
            border: 2px solid white;
            box-shadow: 0 0 0 4px rgba(25,118,210,0.25);
          "></div>
        `,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      }),
    [],
  );
  // console.log(
  //   '[StoresMapView] enableMyLocationFeatures =',
  //   enableMyLocationFeatures,
  // );
  const mappableStores = useMemo(
    () =>
      (stores || []).filter(
        (s) =>
          s.lat != null &&
          s.lng != null &&
          !Number.isNaN(Number(s.lat)) &&
          !Number.isNaN(Number(s.lng)),
      ),
    [stores],
  );

  const getMyLocation = () => {
    setGeoError(null);

    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported in this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMyPos({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        setGeoError(err?.message || 'Location permission denied.');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const storesWithDistance = useMemo(() => {
    if (!myPos) return mappableStores.map((s) => ({ ...s, distanceKm: null }));

    return mappableStores
      .map((s) => ({
        ...s,
        distanceKm: haversineKm(
          { lat: myPos.lat, lng: myPos.lng },
          { lat: Number(s.lat), lng: Number(s.lng) },
        ),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [mappableStores, myPos]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await apiGet('/stores');
        setStores(data?.stores || []);
      } catch (e) {
        console.error('Failed to load stores:', e);
        setStores([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          position: 'relative',
          height,
          width: '100%',
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        {showLoading && loading && (
          <LoadingState text="Loading stores..." sx={{ px: 1.5 }} />
        )}

        {enableMyLocationFeatures && (
          <Box
            sx={{
              position: 'absolute',
              zIndex: 1000,
              bottom: 10,
              left: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 0.75,
            }}
          >
            <PrimaryButton
              variantStyle="primary2"
              size="small"
              onClick={getMyLocation}
              startIcon={<NearMeIcon fontSize="small" />}
            >
              Use my location
            </PrimaryButton>

            {geoError && (
              <Box
                sx={{
                  px: 1,
                  py: 0.75,
                  borderRadius: 1,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  maxWidth: 260,
                }}
              >
                <Typography sx={{ fontSize: 12 }}>{geoError}</Typography>
              </Box>
            )}
          </Box>
        )}

        <MapContainer
          style={{ height: '100%', width: '100%' }}
          center={[51.0447, -114.0719]} // fallback
          zoom={12}
          scrollWheelZoom={scrollWheelZoom}
          zoomControl={false}
        >
          <ZoomControl position="bottomright" />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution="&copy; OSM &copy; CARTO"
          />

          {mappableStores.length > 0 && (
            <FitToStores stores={mappableStores} padding={fitPadding} />
          )}

          {enableMyLocationFeatures && myPos && (
            <Marker position={[myPos.lat, myPos.lng]} icon={myLocationIcon}>
              <Popup>My location</Popup>
            </Marker>
          )}

          {mappableStores.map((s) => (
            <Marker
              key={s.id || s.name}
              position={[Number(s.lat), Number(s.lng)]}
              icon={getStoreMarkerIcon(s?.name, storeIcons)}
            >
              <Tooltip permanent direction="top" offset={[0, -8]} opacity={1}>
                <Typography sx={{ fontSize: 12, color: 'text.primary' }}>
                  {s.name}
                </Typography>
              </Tooltip>

              {showPopups && (
                <Popup>
                  <Card elevation={0} sx={{ minWidth: 320 }}>
                    <CardContent sx={{ p: 1, '&:last-child': { p: 1 } }}>
                      <Typography variant="h5">{s.name}</Typography>

                      <Divider sx={{ mb: 1 }} />

                      <Stack spacing={0.5}>
                        <Typography
                          sx={{ fontSize: 11, color: 'text.secondary' }}
                        >
                          Address
                        </Typography>
                        <Typography sx={{ fontSize: 12.5 }}>
                          {s.address}
                        </Typography>
                      </Stack>

                      <Stack spacing={0.75}>
                        <Typography
                          sx={{ fontSize: 11, color: 'text.secondary' }}
                        >
                          Opening Hours
                        </Typography>
                        {s.operation_time ? (
                          <Typography
                            sx={{ fontSize: 12.5, whiteSpace: 'pre-line' }}
                          >
                            {s.operation_time}
                          </Typography>
                        ) : (
                          <Typography
                            sx={{ fontSize: 12.5, color: 'text.secondary' }}
                          >
                            —
                          </Typography>
                        )}

                        {s.phone && (
                          <>
                            <Typography
                              sx={{ fontSize: 11, color: 'text.secondary' }}
                            >
                              Contact Info
                            </Typography>
                            <Box
                              component="a"
                              href={`tel:${s.phone}`}
                              sx={{
                                fontSize: 12.5,
                                color: 'text.primary',
                                textDecoration: 'none',
                                fontWeight: 600,
                              }}
                            >
                              {s.phone}
                            </Box>
                          </>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Popup>
              )}
            </Marker>
          ))}
        </MapContainer>
      </Box>

      {enableMyLocationFeatures && (
        <Box
          sx={{
            mt: 1,
            p: 1.25,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Typography sx={{ fontWeight: 800, mb: 0.75 }}>
            Nearest stores
          </Typography>

          {!myPos ? (
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              Tap “Use my location” to see the nearest stores.
            </Typography>
          ) : storesWithDistance.length === 0 ? (
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              No stores with valid coordinates.
            </Typography>
          ) : (
            <Stack spacing={0.75}>
              {storesWithDistance.map((s, idx) => (
                <Box
                  key={s.id || s.name}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    gap: 2,
                  }}
                >
                  <Typography sx={{ fontSize: 13 }}>
                    {idx + 1}. {s.name}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: 'text.secondary',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {s.distanceKm?.toFixed(2)} km
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      )}
    </Box>
  );
};

export default StoresMapView;
