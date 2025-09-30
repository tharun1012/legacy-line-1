import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { ScoreBadge } from "@/components/ui/score-badge";
import { 
  MapPin, 
  Bus, 
  Plane, 
  Building2, 
  School, 
  ShoppingCart, 
  Zap, 
  Droplets, 
  Wifi, 
  Navigation2,
  Download,
  Share2,
  Home
} from "lucide-react";

// ----------------- TYPES -----------------
interface AssessmentData {
  googleMapLink: string;
  latitude: string;
  longitude: string;
}

interface AssessmentDashboardProps {
  data: AssessmentData;
  onBack: () => void;
}

interface NearbyPlace {
  name: string;
  type: string;
  distance: string;
}

// ----------------- HELPERS -----------------

// Fetch nearby places using Overpass API
async function fetchNearby(lat: number, lng: number) {
  const query = `
    [out:json];
    (
      node(around:5000,${lat},${lng})[aeroway=aerodrome];    // Airports
      node(around:5000,${lat},${lng})[amenity=bus_station];  // Bus Stations
      node(around:5000,${lat},${lng})[amenity=school];       // Schools
      node(around:5000,${lat},${lng})[shop=mall];            // Shopping Malls
      way(around:5000,${lat},${lng})[natural=water];         // Water bodies
    );
    out center;
  `;

  const url = "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query);
  const res = await fetch(url);
  const data = await res.json();
  return data.elements || [];
}

// Calculate distance (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1) + " km";
}

// ----------------- MAIN COMPONENT -----------------
export function AssessmentDashboard({ data, onBack }: AssessmentDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [transportation, setTransportation] = useState<any>({});
  const [builderProjects, setBuilderProjects] = useState<NearbyPlace[]>([]);
  const [infrastructure, setInfrastructure] = useState<any>({
    roads: "Available",
    power: "Connected",
    water: "Municipal",
    internet: "Fiber"
  });

  const [scores, setScores] = useState({
    las: 0,
    vas: 0,
    overall: 0
  });

  useEffect(() => {
    const lat = parseFloat(data.latitude);
    const lng = parseFloat(data.longitude);

    async function load() {
      setLoading(true);
      const results = await fetchNearby(lat, lng);

      // Find specific categories
      const airport = results.find((r: any) => r.tags?.aeroway === "aerodrome");
      const busStation = results.find((r: any) => r.tags?.amenity === "bus_station");

      setTransportation({
        airport: airport
          ? {
              name: airport.tags.name || "Unnamed Airport",
              distance: calculateDistance(lat, lng, airport.lat || airport.center.lat, airport.lon || airport.center.lon)
            }
          : { name: "No airport nearby", distance: "-" },
        busStand: busStation
          ? {
              name: busStation.tags.name || "Bus Station",
              distance: calculateDistance(lat, lng, busStation.lat, busStation.lon)
            }
          : { name: "No bus station nearby", distance: "-" }
      });

      // Builder projects = Schools, Malls, etc
      const projects: NearbyPlace[] = results
        .filter((r: any) => r.tags?.amenity === "school" || r.tags?.shop === "mall" || r.tags?.natural === "water")
        .map((r: any) => {
          const type =
            r.tags.amenity === "school"
              ? "Educational"
              : r.tags.shop === "mall"
              ? "Commercial"
              : "Water Body";
          return {
            name: r.tags.name || type,
            type,
            distance: calculateDistance(lat, lng, r.lat || r.center.lat, r.lon || r.center.lon)
          };
        });

      setBuilderProjects(projects);

      // Simple scoring logic (can be improved)
      const lasScore = Math.min(10, projects.length * 2);
      const vasScore = Math.min(10, results.length / 5);
      const overall = ((lasScore + vasScore) / 2).toFixed(1);

      setScores({ las: lasScore, vas: vasScore, overall: parseFloat(overall) });
      setLoading(false);
    }

    load();
  }, [data]);

  if (loading) return <p className="p-6 text-center">Loading assessment results...</p>;

  return (
    <div className="min-h-screen bg-background">
      <Header title="Assessment Results" showBackButton onBack={onBack} />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Land Parcel Assessment Results
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {data.latitude}, {data.longitude}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ScoreBadge score={scores.overall} label="Overall Score" size="lg" />
              <Button variant="outline" className="gap-2">
                <Share2 className="h-4 w-4" />
                Share Assessment
              </Button>
              <Button className="gap-2 primary-gradient shadow-button">
                <Download className="h-4 w-4" />
                Download Report
              </Button>
            </div>
          </div>
        </div>

        {/* Assessment Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Transportation Hub */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Plane className="h-5 w-5 text-primary" />
                Transportation Hub
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Plane className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{transportation.airport.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    {transportation.airport.distance}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bus className="h-4 w-4 text-success" />
                    <span className="text-sm font-medium">{transportation.busStand.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-success">
                    {transportation.busStand.distance}
                  </span>
                </div>
              </div>
              
              <div className="pt-3 border-t border-border">
                <ScoreBadge score={8.2} label="Transport Score" className="w-full justify-center" />
              </div>
            </CardContent>
          </Card>

          {/* Builder Projects */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5 text-success" />
                Builder Projects
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {builderProjects.map((project, index) => {
                  const icons = { Educational: School, Commercial: ShoppingCart, "Water Body": Droplets };
                  const Icon = icons[project.type as keyof typeof icons] || Home;
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-success" />
                        <div>
                          <p className="text-sm font-medium">{project.name}</p>
                          <p className="text-xs text-muted-foreground">{project.type}</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-success">
                        {project.distance}
                      </span>
                    </div>
                  );
                })}
              </div>
              
              <div className="pt-3 border-t border-border">
                <ScoreBadge score={7.9} label="Development Score" className="w-full justify-center" />
              </div>
            </CardContent>
          </Card>

          {/* Infrastructure */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5 text-warning" />
                Infrastructure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Navigation2 className="h-4 w-4 text-warning" />
                    <span className="text-sm font-medium">Roads</span>
                  </div>
                  <span className="text-sm font-semibold text-success">
                    {infrastructure.roads}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Zap className="h-4 w-4 text-warning" />
                    <span className="text-sm font-medium">Power</span>
                  </div>
                  <span className="text-sm font-semibold text-success">
                    {infrastructure.power}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Droplets className="h-4 w-4 text-warning" />
                    <span className="text-sm font-medium">Water</span>
                  </div>
                  <span className="text-sm font-semibold text-success">
                    {infrastructure.water}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Wifi className="h-4 w-4 text-warning" />
                    <span className="text-sm font-medium">Internet</span>
                  </div>
                  <span className="text-sm font-semibold text-success">
                    {infrastructure.internet}
                  </span>
                </div>
              </div>
              
              <div className="pt-3 border-t border-border">
                <ScoreBadge score={8.8} label="Infrastructure Score" className="w-full justify-center" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Scoring */}
        <Card className="mt-8 shadow-card">
          <CardHeader>
            <CardTitle className="text-xl">Comprehensive Assessment Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-muted/30 rounded-lg">
                <h3 className="font-semibold mb-2">LAS (Land Assessment Score)</h3>
                <ScoreBadge score={scores.las} size="lg" className="mb-3" />
                <p className="text-sm text-muted-foreground">
                  Location quality, infrastructure, connectivity, and future development potential
                </p>
              </div>
              
              <div className="text-center p-6 bg-muted/30 rounded-lg">
                <h3 className="font-semibold mb-2">VAS (Value Assessment Score)</h3>
                <ScoreBadge score={scores.vas} size="lg" className="mb-3" />
                <p className="text-sm text-muted-foreground">
                  Investment value, cost-benefit ratio, market appreciation potential
                </p>
              </div>
              
              <div className="text-center p-6 bg-muted/30 rounded-lg">
                <h3 className="font-semibold mb-2">Overall Score</h3>
                <ScoreBadge score={scores.overall} size="lg" className="mb-3" />
                <p className="text-sm text-muted-foreground">
                  Comprehensive evaluation combining all factors
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
