import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import { Box } from '@mui/material';
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
      >
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
            {showPopups && (
              <Popup>
                <div style={{ minWidth: 220 }}>
                  <div style={{ fontWeight: 800 }}>{s.name}</div>
                  <div style={{ fontSize: 13, marginTop: 6 }}>
                    {s.address}
                    {s.city ? `, ${s.city}` : ''}
                  </div>

                  {s.operation_time && (
                    <div
                      style={{
                        fontSize: 13,
                        marginTop: 6,
                        whiteSpace: 'pre-line',
                      }}
                    >
                      🕒 {s.operation_time}
                    </div>
                  )}

                  {s.phone && (
                    <div style={{ fontSize: 13, marginTop: 6 }}>
                      📞 <a href={`tel:${s.phone}`}>{s.phone}</a>
                    </div>
                  )}
                </div>
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
    </Box>
  );
}
