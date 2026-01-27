import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";

const stores = [
    // ✅ 여기만 너가 원하는 마트로 바꾸면 됨
    { name: "T&T Supermarket", lat: 51.0377, lng: -114.0722 },
    { name: "A-Mart", lat: 51.0469, lng: -114.0714 },
    { name: "H-Mart", lat: 51.0501, lng: -114.0853 },
];

function FitToStores() {
    const map = useMap();

    useEffect(() => {
        const bounds = L.latLngBounds(stores.map((s) => [s.lat, s.lng]));
        map.fitBounds(bounds, { padding: [40, 40] });
    }, [map]);

    return null;
}

export default function StoresMap() {
    return (
        <MapContainer
            style={{ height: "60vh", width: "100%", borderRadius: 16 }}
            center={[51.0447, -114.0719]} // 임시값 (fitBounds가 곧 덮어씀)
            zoom={12}
            scrollWheelZoom
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; OSM &copy; CARTO'
            />


            <FitToStores />

            {stores.map((s) => (
                <Marker key={s.name} position={[s.lat, s.lng]}>
                    <Popup>{s.name}</Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}

