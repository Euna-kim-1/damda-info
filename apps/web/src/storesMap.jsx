import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { apiGet } from "../src/shared/api/client";

function FitToStores({ stores }) {
    const map = useMap();

    useEffect(() => {
        if (!stores?.length) return;

        const bounds = L.latLngBounds(
            stores.map((s) => [Number(s.lat), Number(s.lng)])
        );

        map.fitBounds(bounds, { padding: [40, 40] });
    }, [map, stores]);

    return null;
}

export default function StoresMap() {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);

    // ✅ lat/lng 있는 store만 지도에 표시
    const mappableStores = useMemo(
        () =>
            (stores || []).filter(
                (s) => s.lat != null && s.lng != null && !Number.isNaN(Number(s.lat)) && !Number.isNaN(Number(s.lng))
            ),
        [stores]
    );

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const data = await apiGet("/stores");
                setStores(data?.stores || []);
            } catch (e) {
                console.error("Failed to load stores:", e);
                setStores([]);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <div style={{ height: "60vh", width: "100%", borderRadius: 16, overflow: "hidden" }}>
            {loading && (
                <div style={{ padding: 12 }}>Loading stores…</div>
            )}

            <MapContainer
                style={{ height: "100%", width: "100%" }}
                center={[51.0447, -114.0719]} // fallback
                zoom={12}
                scrollWheelZoom
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution="&copy; OSM &copy; CARTO"
                />

                {/* ✅ stores가 있을 때만 fitBounds */}
                {mappableStores.length > 0 && <FitToStores stores={mappableStores} />}

                {mappableStores.map((s) => (
                    <Marker key={s.id || s.name} position={[Number(s.lat), Number(s.lng)]}>
                        <Popup>
                            <div style={{ minWidth: 220 }}>
                                <div style={{ fontWeight: 800 }}>{s.name}</div>
                                <div style={{ fontSize: 13, marginTop: 6 }}>
                                    {s.address}{s.city ? `, ${s.city}` : ""}
                                </div>

                                {s.operation_time && (
                                    <div style={{ fontSize: 13, marginTop: 6, whiteSpace: "pre-line" }}>
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
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
