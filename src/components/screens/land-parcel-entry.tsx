import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { MapPin, Link, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

interface LandParcelEntryProps {
  onBack: () => void;
  onContinue: (data: { googleMapLink: string; latitude: string; longitude: string }) => void;
}

// Parser to extract coordinates from Google Maps URL
async function parseGoogleMapsLink(url: string): Promise<{ lat: number; lng: number } | null> {
  try {
    let urlToProcess = url;

    // If it's a shortened URL (goo.gl or maps.app.goo.gl), expand it first
    if (url.includes('goo.gl') || url.includes('maps.app.goo.gl')) {
      try {
        // Use a CORS proxy to expand the shortened URL
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl, {
          redirect: 'follow'
        });
        
        // Get the final URL after redirects
        const html = await response.text();
        
        // Try to extract coordinates from the HTML content
        const coordMatch = html.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
        if (coordMatch) {
          return { lat: parseFloat(coordMatch[1]), lng: parseFloat(coordMatch[2]) };
        }
        
        // If we can't extract from HTML, try to get the URL from meta tags
        const metaMatch = html.match(/content="https:\/\/www\.google\.com\/maps[^"]*@(-?\d+\.?\d*),(-?\d+\.?\d*)"/);
        if (metaMatch) {
          return { lat: parseFloat(metaMatch[1]), lng: parseFloat(metaMatch[2]) };
        }
      } catch (e) {
        console.error('Error expanding shortened URL:', e);
      }
    }

    // Pattern 1: /@lat,lng,zoom format (most common)
    const regex1 = /@(-?\d+\.?\d*),(-?\d+\.?\d*)/;
    const match1 = urlToProcess.match(regex1);
    if (match1) {
      return { lat: parseFloat(match1[1]), lng: parseFloat(match1[2]) };
    }

    // Pattern 2: /place/name/@lat,lng format
    const regex2 = /\/place\/[^/]+\/@(-?\d+\.?\d*),(-?\d+\.?\d*)/;
    const match2 = urlToProcess.match(regex2);
    if (match2) {
      return { lat: parseFloat(match2[1]), lng: parseFloat(match2[2]) };
    }

    // Pattern 3: ?q=lat,lng format
    const regex3 = /[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/;
    const match3 = urlToProcess.match(regex3);
    if (match3) {
      return { lat: parseFloat(match3[1]), lng: parseFloat(match3[2]) };
    }

    // Pattern 4: /maps/place/lat,lng format
    const regex4 = /\/maps\/place\/(-?\d+\.?\d*),(-?\d+\.?\d*)/;
    const match4 = urlToProcess.match(regex4);
    if (match4) {
      return { lat: parseFloat(match4[1]), lng: parseFloat(match4[2]) };
    }

    // Pattern 5: ll=lat,lng format
    const regex5 = /ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/;
    const match5 = urlToProcess.match(regex5);
    if (match5) {
      return { lat: parseFloat(match5[1]), lng: parseFloat(match5[2]) };
    }

    return null;
  } catch {
    return null;
  }
}

export function LandParcelEntry({ onBack, onContinue }: LandParcelEntryProps) {
  const [googleMapLink, setGoogleMapLink] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [showPopup, setShowPopup] = useState(true);
  const [linkError, setLinkError] = useState("");
  const [isExpanding, setIsExpanding] = useState(false);

  const handleMapLinkChange = async (value: string) => {
    setGoogleMapLink(value);
    setLinkError("");

    if (value.trim()) {
      // Check if it's a shortened URL
      if (value.includes('goo.gl') || value.includes('maps.app.goo.gl')) {
        setIsExpanding(true);
        setLinkError("Expanding shortened URL...");
      }

      const coords = await parseGoogleMapsLink(value);
      setIsExpanding(false);
      
      if (coords) {
        setLatitude(coords.lat.toString());
        setLongitude(coords.lng.toString());
        setLinkError("");
      } else {
        setLatitude("");
        setLongitude("");
        if (value.length > 10) {
          setLinkError("Could not extract coordinates. Try copying the URL from your browser's address bar instead.");
        }
      }
    } else {
      setLatitude("");
      setLongitude("");
      setIsExpanding(false);
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
                {linkError ? (
                  <p className={cn("text-xs", isExpanding ? "text-blue-600" : "text-red-600")}>
                    {linkError}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Supports both full URLs and shortened goo.gl links
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude" className="text-sm font-medium">Latitude</Label>
                  <Input
                    id="latitude"
                    placeholder="Auto-extracted"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className={cn("h-12")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude" className="text-sm font-medium">Longitude</Label>
                  <Input
                    id="longitude"
                    placeholder="Auto-extracted"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className={cn("h-12")}
                  />
                </div>
              </div>

              {isValid && (
                <div className="flex items-center gap-2 text-sm text-success">
                  <Navigation className="h-4 w-4" />
                  Coordinates ready for assessment
                </div>
              )}

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
                <Map
                  initialViewState={{
                    latitude: parseFloat(latitude),
                    longitude: parseFloat(longitude),
                    zoom: 14,
                  }}
                  style={{ width: "100%", height: "100%" }}
                  mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                >
                  <NavigationControl position="top-right" />
                  <Marker
                    latitude={parseFloat(latitude)}
                    longitude={parseFloat(longitude)}
                    color="red"
                    onClick={(e) => {
                      e.originalEvent.stopPropagation();
                      setShowPopup(true);
                    }}
                  />
                  {showPopup && (
                    <Popup
                      latitude={parseFloat(latitude)}
                      longitude={parseFloat(longitude)}
                      anchor="top"
                      onClose={() => setShowPopup(false)}
                    >
                      Main Land Parcel
                    </Popup>
                  )}
                </Map>
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