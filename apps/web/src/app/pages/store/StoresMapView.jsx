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

function FitToStores({ stores, padding }) {
  const map = useMap();

  useEffect(() => {
    if (!stores?.length) return;

    const bounds = L.latLngBounds(
      stores.map((s) => [Number(s.lat), Number(s.lng)]),
    );

    map.fitBounds(bounds, { padding });
  }, [map, stores, padding]);

  return null;
}

export default function StoresMapView({
  height = 220,
  scrollWheelZoom = false,
  fitPadding = [20, 20],
  showPopups = false,
  showLoading = true,
}) {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <Box
      sx={{
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
        <div style={{ padding: 12 }}>Loading stores…</div>
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

        {mappableStores.map((s) => (
          <Marker
            key={s.id || s.name}
            position={[Number(s.lat), Number(s.lng)]}
          >
            <Tooltip permanent direction="top" offset={[0, -8]} opacity={1}>
              <Typography
                sx={{
                  fontSize: 12,
                  color: 'text.primary',
                }}
              >
                {s.name}
              </Typography>
            </Tooltip>

            {showPopups && (
              <Popup>
                <Card
                  elevation={0}
                  sx={{
                    minWidth: 320,
                  }}
                >
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
                          sx={{
                            fontSize: 12.5,
                            whiteSpace: 'pre-line',
                          }}
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
  );
}
