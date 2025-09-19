import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { LatLngExpression } from "leaflet";
import { useEffect } from "react";

type Props = {
  lat: number;
  lng: number;
};

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Component to smoothly recenter the map
function SmoothRecenter({ position }: { position: LatLngExpression }) {
  const map = useMap();

  useEffect(() => {
    // Smoothly animate to the new position
    map.flyTo(position, map.getZoom(), {
      animate: true,
      duration: 1.5, // duration in seconds
    });
  }, [position, map]);

  return null;
}

export default function MapView({ lat, lng }: Props) {
  const position: LatLngExpression = [lat, lng];

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: "400px", width: "100%", borderRadius: "12px" }}
      scrollWheelZoom
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
      />
      <Marker position={position} icon={markerIcon}>
        <Popup>Selected Location</Popup>
      </Marker>
      <SmoothRecenter position={position} />
    </MapContainer>
  );
}
