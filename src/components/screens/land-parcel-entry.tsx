import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { MapPin, Link, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Marker icon
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Component to fly to the marker
function FlyToMarker({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  map.flyTo([lat, lng], 15, { duration: 1.5 });
  return null;
}

interface LandParcelEntryProps {
  onBack: () => void;
  onContinue: (data: { googleMapLink: string; latitude: string; longitude: string }) => void;
}

export function LandParcelEntry({ onBack, onContinue }: LandParcelEntryProps) {
  const [googleMapLink, setGoogleMapLink] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);

  const extractCoordinates = (mapUrl: string) => {
    setIsExtracting(true);
    setTimeout(() => {
      if (mapUrl.includes("maps") || mapUrl.includes("google")) {
        setLatitude("12.9716");
        setLongitude("77.5946");
      }
      setIsExtracting(false);
    }, 1500);
  };

  const handleMapLinkChange = (value: string) => {
    setGoogleMapLink(value);
    if (value.trim()) {
      extractCoordinates(value);
    } else {
      setLatitude("");
      setLongitude("");
    }
  };

  const handleContinue = () => {
    if (latitude && longitude) {
      onContinue({ googleMapLink, latitude, longitude });
    }
  };

  const isValid = latitude && longitude;

  return (
    <div className="min-h-screen bg-background">
      <Header title="Enter Land Parcel Details" showBackButton onBack={onBack} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Land Parcel Details Entry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Google Maps Link */}
              <div className="space-y-2">
                <Label htmlFor="map-link" className="text-sm font-medium flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  Google Map Link
                </Label>
                <Input
                  id="map-link"
                  placeholder="Paste Google Maps URL here..."
                  value={googleMapLink}
                  onChange={(e) => handleMapLinkChange(e.target.value)}
                  className="h-12"
                />
                <p className="text-xs text-muted-foreground">
                  Coordinates will be extracted automatically
                </p>
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude" className="text-sm font-medium">
                    Latitude
                  </Label>
                  <Input
                    id="latitude"
                    placeholder="Auto-extracted"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className={cn("h-12", isExtracting && "animate-pulse")}
                    disabled={isExtracting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude" className="text-sm font-medium">
                    Longitude
                  </Label>
                  <Input
                    id="longitude"
                    placeholder="Auto-extracted"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className={cn("h-12", isExtracting && "animate-pulse")}
                    disabled={isExtracting}
                  />
                </div>
              </div>

              {/* Status */}
              {isExtracting && (
                <div className="flex items-center gap-2 text-sm text-primary">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Extracting coordinates...
                </div>
              )}

              {isValid && (
                <div className="flex items-center gap-2 text-sm text-success">
                  <Navigation className="h-4 w-4" />
                  Coordinates ready for assessment
                </div>
              )}

              {/* Continue Button */}
              <Button
                onClick={handleContinue}
                disabled={!isValid}
                className="w-full h-12 primary-gradient shadow-button hover:shadow-glow disabled:opacity-50"
              >
                → Continue to Assessment
              </Button>
            </CardContent>
          </Card>

          {/* Map Preview */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Live Map Preview</CardTitle>
            </CardHeader>
            <CardContent className="h-96">
              {isValid ? (
                <MapContainer
                  center={[parseFloat(latitude), parseFloat(longitude)]}
                  zoom={15}
                  style={{ width: "100%", height: "100%" }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                  />
                  <Marker
                    position={[parseFloat(latitude), parseFloat(longitude)]}
                    icon={markerIcon}
                  >
                    <Popup>Main Land Parcel</Popup>
                  </Marker>
                  <FlyToMarker
                    lat={parseFloat(latitude)}
                    lng={parseFloat(longitude)}
                  />
                </MapContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <MapPin className="h-12 w-12 mb-2 opacity-50" />
                  <p>Map preview will appear here</p>
                  <p className="text-sm">when you paste a Google Maps link</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
