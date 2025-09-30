import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { LatLngExpression } from "leaflet";
import { useEffect, useState } from "react";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";

interface MapViewProps {
  lat: number;
  lng: number;
}

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function SearchControl({ onResult }: { onResult: (latlng: LatLngExpression) => void }) {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();

    // Remove 'new' here
    const searchControl = GeoSearchControl({
      provider,
      style: "bar",
      autoClose: true,
      keepResult: true,
    });

    map.addControl(searchControl);

    const handleLocation = (e: any) => {
      const { x, y } = e.location; // x = lng, y = lat
      onResult([y, x]); // array
    };

    map.on("geosearch/showlocation", handleLocation);

    return () => {
      map.removeControl(searchControl);
      map.off("geosearch/showlocation", handleLocation);
    };
  }, [map, onResult]);

  return null;
}

// Fetch nearby features using Overpass API
async function fetchNearby(lat: number, lng: number) {
  const query = `
    [out:json];
    (
      node(around:5000,${lat},${lng})[aeroway=aerodrome];
      node(around:5000,${lat},${lng})[amenity=bus_station];
      node(around:5000,${lat},${lng})[amenity=school];
      node(around:5000,${lat},${lng})[shop=mall];
      way(around:5000,${lat},${lng})[natural=water];
    );
    out center;
  `;

  const url = "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query);

  const res = await fetch(url);
  const data = await res.json();
  return data.elements || [];
}

export default function MapView({ lat, lng }: MapViewProps) {
  const [userLocation, setUserLocation] = useState<LatLngExpression>([lat, lng]);
  const [destination, setDestination] = useState<LatLngExpression | null>(null);
  const [nearby, setNearby] = useState<any[]>([]);

  // Load nearby places for given coordinates
  const loadNearby = async (lat: number, lng: number) => {
    const results = await fetchNearby(lat, lng);
    setNearby(results);
  };

  useEffect(() => {
    loadNearby(lat, lng);
  }, [lat, lng]);

  return (
    <div style={{ display: "flex", gap: "16px" }}>
      {/* Map Section */}
      <MapContainer
        center={userLocation}
        zoom={13}
        style={{ height: "500px", width: "70%", borderRadius: "12px" }}
        scrollWheelZoom
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        />

        <Marker position={userLocation} icon={markerIcon}>
          <Popup>Land Parcel Location</Popup>
        </Marker>

        {destination && (
          <Marker position={destination} icon={markerIcon}>
            <Popup>Destination</Popup>
          </Marker>
        )}

        <SearchControl
          onResult={(latlng) => {
            setDestination(latlng); 
            loadNearby(latlng[0], latlng[1]);
          }}
        />
      </MapContainer>

      {/* Sidebar for Nearby Info */}
      <div style={{ width: "30%", background: "#f9f9f9", padding: "12px", borderRadius: "8px" }}>
        <h3>Nearby Features</h3>
        {nearby.length === 0 ? (
          <p>No data found nearby.</p>
        ) : (
          <ul>
            {nearby.map((item, idx) => (
              <li key={idx}>
                <strong>{item.tags.name || "Unnamed"}</strong> —{" "}
                {item.tags.aeroway
                  ? "Airport"
                  : item.tags.amenity === "bus_station"
                  ? "Bus Station"
                  : item.tags.amenity === "school"
                  ? "School"
                  : item.tags.shop === "mall"
                  ? "Shopping Mall"
                  : item.tags.natural === "water"
                  ? "Water Body"
                  : "Other"}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
