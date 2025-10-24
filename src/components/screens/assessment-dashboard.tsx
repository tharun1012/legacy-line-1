import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { ScoreBadge } from "@/components/ui/score-badge";
import { Label } from "@/components/ui/label";
import { 
  MapPin, 
  Bus, 
  GraduationCap, 
  ShoppingBag, 
  Zap, 
  Droplets, 
  Wifi, 
  Navigation2,
  Download,
  Share2,
  Loader2,
  Home,
  Waves,
  Building2
} from "lucide-react";

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
  distance: number;
  category: string;
  lat?: number;
  lng?: number;
}

interface ResidentialProject {
  id: number;
  project_name: string;
  latitude: number;
  longitude: number;
  distance: number;
  url?: string;
}

const SUPABASE_URL = "https://mowugexywvklirxwzpdh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vd3VnZXh5d3ZrbGlyeHd6cGRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyOTYzOTEsImV4cCI6MjA3NDg3MjM5MX0.eJnBHRcnZ-3MPw9HYgGPXSfuAT_QnuarmOI2ogaCQeg";

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

async function fetchResidentialProjects(lat: number, lng: number): Promise<ResidentialProject[]> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/residentialprojects?select=id,project_name,latitude,longitude,url`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Supabase error! status: ${response.status}`);
    }

    const projects = await response.json();
    
    const projectsWithDistance = projects
      .map((project: any) => {
        if (!project.latitude || !project.longitude) return null;
        
        const distance = calculateDistance(lat, lng, project.latitude, project.longitude);
        
        return {
          id: project.id,
          project_name: project.project_name || 'Unnamed Project',
          latitude: project.latitude,
          longitude: project.longitude,
          distance: parseFloat(distance.toFixed(2)),
          url: project.url
        };
      })
      .filter((project: any) => project !== null && project.distance <= 5)
      .sort((a: ResidentialProject, b: ResidentialProject) => a.distance - b.distance);

    return projectsWithDistance;
  } catch (error) {
    console.error('Error fetching residential projects:', error);
    return [];
  }
}

async function fetchNearbyPlaces(lat: number, lng: number, radius: number, tags: string[]): Promise<NearbyPlace[]> {
  try {
    const radiusMeters = radius * 1000;
    
    let queries = '';
    tags.forEach(tag => {
      queries += `node[${tag}](around:${radiusMeters},${lat},${lng});\n`;
      queries += `way[${tag}](around:${radiusMeters},${lat},${lng});\n`;
      queries += `relation[${tag}](around:${radiusMeters},${lat},${lng});\n`;
    });
    
    const query = `
      [out:json][timeout:25];
      (
        ${queries}
      );
      out center;
    `;

    const url = "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query);
    console.log('Fetching with radius:', radius, 'km for tags:', tags);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    const elements = data.elements || [];
    console.log('Found elements:', elements.length);
    
    const places = elements
      .map((element: any) => {
        const elementLat = element.lat || element.center?.lat;
        const elementLon = element.lon || element.center?.lon;
        
        if (!elementLat || !elementLon) return null;
        
        const distance = calculateDistance(lat, lng, elementLat, elementLon);
        
        if (distance > radius) return null;
        
        return {
          name: element.tags?.name || element.tags?.operator || element.tags?.shop || 'Unnamed',
          distance: parseFloat(distance.toFixed(2)),
          category: element.tags?.amenity || element.tags?.natural || element.tags?.shop || 
                   element.tags?.water || element.tags?.highway || element.tags?.railway || 
                   element.tags?.aeroway || element.tags?.building || 'Unknown',
          lat: elementLat,
          lng: elementLon,
        };
      })
      .filter((item: any) => item !== null && item.name !== 'Unnamed')
      .sort((a: NearbyPlace, b: NearbyPlace) => a.distance - b.distance);
    
    return places;
  } catch (error) {
    console.error('Error fetching nearby places:', error);
    return [];
  }
}

function calculateScore(places: NearbyPlace[]): number {
  if (places.length === 0) return 0;
  
  let score = Math.min(places.length * 1.5, 5);
  
  const veryClose = places.filter(p => p.distance < 1).length;
  score += Math.min(veryClose * 0.5, 3);
  
  if (places[0]) {
    const proximityBonus = Math.max(0, 2 - places[0].distance);
    score += proximityBonus;
  }
  
  return Math.min(parseFloat(score.toFixed(1)), 10);
}

export function AssessmentDashboard({ data, onBack }: AssessmentDashboardProps) {
  const [educationalRadius, setEducationalRadius] = useState("5");
  const [commercialRadius, setCommercialRadius] = useState("5");
  const [waterBodiesRadius, setWaterBodiesRadius] = useState("5");
  const [transportRadius, setTransportRadius] = useState("5");
  
  const [educationalDataFull, setEducationalDataFull] = useState<NearbyPlace[]>([]);
  const [commercialDataFull, setCommercialDataFull] = useState<NearbyPlace[]>([]);
  const [waterBodiesDataFull, setWaterBodiesDataFull] = useState<NearbyPlace[]>([]);
  const [transportDataFull, setTransportDataFull] = useState<NearbyPlace[]>([]);
  
  const [educationalData, setEducationalData] = useState<NearbyPlace[]>([]);
  const [commercialData, setCommercialData] = useState<NearbyPlace[]>([]);
  const [waterBodiesData, setWaterBodiesData] = useState<NearbyPlace[]>([]);
  const [transportData, setTransportData] = useState<NearbyPlace[]>([]);
  const [residentialProjects, setResidentialProjects] = useState<ResidentialProject[]>([]);
  
  const [loadingEducational, setLoadingEducational] = useState(false);
  const [loadingCommercial, setLoadingCommercial] = useState(false);
  const [loadingWater, setLoadingWater] = useState(false);
  const [loadingTransport, setLoadingTransport] = useState(false);
  const [loadingResidential, setLoadingResidential] = useState(false);
  
  const [infrastructure] = useState({
    roads: "Available",
    power: "Connected",
    water: "Municipal",
    internet: "Fiber"
  });

  const [scores, setScores] = useState({
    education: 0,
    commercial: 0,
    transport: 0,
    water: 0,
    residential: 0,
    infrastructure: 8.8,
    overall: 0
  });

  const radiusOptions = [
    { value: "0.5", label: "500 meters" },
    { value: "1", label: "1 km" },
    { value: "1.5", label: "1.5 km" },
    { value: "2", label: "2 km" },
    { value: "3", label: "3 km" },
    { value: "5", label: "5 km" },
  ];

  const lat = parseFloat(data.latitude);
  const lng = parseFloat(data.longitude);

  useEffect(() => {
    if (lat && lng) {
      setLoadingResidential(true);
      fetchResidentialProjects(lat, lng).then(projects => {
        console.log('Residential projects found:', projects.length);
        setResidentialProjects(projects);
        setLoadingResidential(false);
      }).catch(err => {
        console.error('Failed to load residential projects:', err);
        setLoadingResidential(false);
      });
    }
  }, [lat, lng]);

  useEffect(() => {
    if (lat && lng) {
      setLoadingEducational(true);
      
      fetchNearbyPlaces(
        lat,
        lng,
        5,
        ['amenity=school', 'amenity=college', 'amenity=university', 'amenity=kindergarten', 'building=school', 'building=university']
      ).then(data => {
        console.log('Educational institutions loaded:', data.length);
        setEducationalDataFull(data);
        setEducationalData(data.filter(place => place.distance <= parseFloat(educationalRadius)));
        setLoadingEducational(false);
      }).catch(err => {
        console.error('Failed to load educational data:', err);
        setEducationalDataFull([]);
        setEducationalData([]);
        setLoadingEducational(false);
      });
    }
  }, [lat, lng]);
  
  useEffect(() => {
    const radius = parseFloat(educationalRadius);
    const filtered = educationalDataFull.filter(place => place.distance <= radius);
    setEducationalData(filtered);
  }, [educationalRadius, educationalDataFull]);

  useEffect(() => {
    if (lat && lng) {
      setLoadingCommercial(true);
      
      fetchNearbyPlaces(
        lat,
        lng,
        5,
        ['shop=mall', 'shop=supermarket', 'amenity=marketplace', 'shop=department_store', 'building=commercial', 'building=retail', 'shop=convenience']
      ).then(data => {
        console.log('Commercial buildings loaded:', data.length);
        setCommercialDataFull(data);
        setCommercialData(data.filter(place => place.distance <= parseFloat(commercialRadius)));
        setLoadingCommercial(false);
      }).catch(err => {
        console.error('Failed to load commercial data:', err);
        setCommercialDataFull([]);
        setCommercialData([]);
        setLoadingCommercial(false);
      });
    }
  }, [lat, lng]);
  
  useEffect(() => {
    const radius = parseFloat(commercialRadius);
    const filtered = commercialDataFull.filter(place => place.distance <= radius);
    setCommercialData(filtered);
  }, [commercialRadius, commercialDataFull]);

  useEffect(() => {
    if (lat && lng) {
      setLoadingWater(true);
      
      fetchNearbyPlaces(
        lat,
        lng,
        5,
        ['natural=water', 'water=lake', 'water=river', 'water=reservoir', 'water=pond', 'water=canal', 'waterway=river']
      ).then(data => {
        console.log('Water bodies loaded:', data.length);
        setWaterBodiesDataFull(data);
        setWaterBodiesData(data.filter(place => place.distance <= parseFloat(waterBodiesRadius)));
        setLoadingWater(false);
      }).catch(err => {
        console.error('Failed to load water data:', err);
        setWaterBodiesDataFull([]);
        setWaterBodiesData([]);
        setLoadingWater(false);
      });
    }
  }, [lat, lng]);
  
  useEffect(() => {
    const radius = parseFloat(waterBodiesRadius);
    const filtered = waterBodiesDataFull.filter(place => place.distance <= radius);
    setWaterBodiesData(filtered);
  }, [waterBodiesRadius, waterBodiesDataFull]);

  useEffect(() => {
    if (lat && lng) {
      setLoadingTransport(true);
      
      fetchNearbyPlaces(
        lat,
        lng,
        5,
        [
          'highway=bus_stop',
          'amenity=bus_station', 
          'railway=station', 
          'railway=halt',
          'railway=tram_stop',
          'public_transport=station',
          'public_transport=stop_position',
          'aeroway=aerodrome',
          'aeroway=terminal',
          'amenity=taxi',
          'amenity=ferry_terminal'
        ]
      ).then(data => {
        console.log('Transportation loaded:', data.length);
        setTransportDataFull(data);
        setTransportData(data.filter(place => place.distance <= parseFloat(transportRadius)));
        setLoadingTransport(false);
      }).catch(err => {
        console.error('Failed to load transport data:', err);
        setTransportDataFull([]);
        setTransportData([]);
        setLoadingTransport(false);
      });
    }
  }, [lat, lng]);
  
  useEffect(() => {
    const radius = parseFloat(transportRadius);
    const filtered = transportDataFull.filter(place => place.distance <= radius);
    setTransportData(filtered);
  }, [transportRadius, transportDataFull]);

  useEffect(() => {
    const educationScore = calculateScore(educationalData);
    const commercialScore = calculateScore(commercialData);
    const transportScore = calculateScore(transportData);
    const waterScore = calculateScore(waterBodiesData);
    
    const residentialScore = Math.min(residentialProjects.length * 2, 10);
    
    const infrastructureScore = 8.8;
    
    const overall = (educationScore + commercialScore + transportScore + waterScore + residentialScore + infrastructureScore) / 6;
    
    setScores({
      education: educationScore,
      commercial: commercialScore,
      transport: transportScore,
      water: waterScore,
      residential: residentialScore,
      infrastructure: infrastructureScore,
      overall: parseFloat(overall.toFixed(1))
    });
  }, [educationalData, commercialData, transportData, waterBodiesData, residentialProjects]);

  const renderPlacesList = (places: NearbyPlace[], loading: boolean, icon: any) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
        </div>
      );
    }

    if (places.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No places found in this radius</p>
          <p className="text-xs mt-1">Try increasing the search radius</p>
        </div>
      );
    }

    return (
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {places.map((place, index) => {
          const Icon = icon;
          return (
            <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Icon className="h-4 w-4 text-primary flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{place.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{place.category}</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-green-600 whitespace-nowrap ml-2">
                {place.distance} km
              </span>
            </div>
          );
        })}
        <p className="text-xs text-center text-muted-foreground pt-2">
          Total: {places.length} places
        </p>
      </div>
    );
  };

  const renderResidentialProjects = () => {
    if (loadingResidential) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Loading projects...</span>
        </div>
      );
    }

    if (residentialProjects.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No residential projects found within 5 km</p>
        </div>
      );
    }

    return (
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {residentialProjects.map((project) => (
          <div key={project.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Home className="h-4 w-4 text-primary flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate">{project.project_name}</p>
                {project.url && (
                  <a 
                    href={project.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    View Project
                  </a>
                )}
              </div>
            </div>
            <span className="text-sm font-semibold text-green-600 whitespace-nowrap ml-2">
              {project.distance} km
            </span>
          </div>
        ))}
        <p className="text-xs text-center text-muted-foreground pt-2">
          Total: {residentialProjects.length} projects
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header title="Assessment Results" showBackButton onBack={onBack} />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
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
                Share
              </Button>
              <Button className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Educational Institutions
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Label htmlFor="edu-radius" className="text-sm text-white/90">Radius:</Label>
                  <select
                    id="edu-radius"
                    value={educationalRadius}
                    onChange={(e) => setEducationalRadius(e.target.value)}
                    className="bg-white/20 text-white border border-white/30 rounded-md px-3 py-1.5 text-sm backdrop-blur-sm cursor-pointer hover:bg-white/30 transition-colors"
                  >
                    {radiusOptions.map(opt => (
                      <option key={opt.value} value={opt.value} className="text-slate-800 bg-white">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {renderPlacesList(educationalData, loadingEducational, GraduationCap)}
              <div className="pt-4 mt-4 border-t border-border">
                <ScoreBadge score={scores.education} label="Education Score" className="w-full justify-center" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Commercial Buildings
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Label htmlFor="commercial-radius" className="text-sm text-white/90">Radius:</Label>
                  <select
                    id="commercial-radius"
                    value={commercialRadius}
                    onChange={(e) => setCommercialRadius(e.target.value)}
                    className="bg-white/20 text-white border border-white/30 rounded-md px-3 py-1.5 text-sm backdrop-blur-sm cursor-pointer hover:bg-white/30 transition-colors"
                  >
                    {radiusOptions.map(opt => (
                      <option key={opt.value} value={opt.value} className="text-slate-800 bg-white">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {renderPlacesList(commercialData, loadingCommercial, ShoppingBag)}
              <div className="pt-4 mt-4 border-t border-border">
                <ScoreBadge score={scores.commercial} label="Commercial Score" className="w-full justify-center" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5" />
                  Water Bodies
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Label htmlFor="water-radius" className="text-sm text-white/90">Radius:</Label>
                  <select
                    id="water-radius"
                    value={waterBodiesRadius}
                    onChange={(e) => setWaterBodiesRadius(e.target.value)}
                    className="bg-white/20 text-white border border-white/30 rounded-md px-3 py-1.5 text-sm backdrop-blur-sm cursor-pointer hover:bg-white/30 transition-colors"
                  >
                    {radiusOptions.map(opt => (
                      <option key={opt.value} value={opt.value} className="text-slate-800 bg-white">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {renderPlacesList(waterBodiesData, loadingWater, Droplets)}
              <div className="pt-4 mt-4 border-t border-border">
                <ScoreBadge score={scores.water} label="Water Bodies Score" className="w-full justify-center" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bus className="h-5 w-5" />
                  Transportation Hub
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Label htmlFor="transport-radius" className="text-sm text-white/90">Radius:</Label>
                  <select
                    id="transport-radius"
                    value={transportRadius}
                    onChange={(e) => setTransportRadius(e.target.value)}
                    className="bg-white/20 text-white border border-white/30 rounded-md px-3 py-1.5 text-sm backdrop-blur-sm cursor-pointer hover:bg-white/30 transition-colors"
                  >
                    {radiusOptions.map(opt => (
                      <option key={opt.value} value={opt.value} className="text-slate-800 bg-white">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {renderPlacesList(transportData, loadingTransport, Bus)}
              <div className="pt-4 mt-4 border-t border-border">
                <ScoreBadge score={scores.transport} label="Transport Score" className="w-full justify-center" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg border-0 mb-6">
          <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Nearby Residential Projects
              </CardTitle>
              <span className="text-sm text-white/90">Within 5 km radius</span>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {renderResidentialProjects()}
            <div className="pt-4 mt-4 border-t border-border">
              <ScoreBadge score={scores.residential} label="Residential Score" className="w-full justify-center" />
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <Waves className="h-5 w-5" />
                Ground Water Levels
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12">
                <Waves className="h-16 w-16 text-blue-500/30 mb-4" />
                <p className="text-lg font-semibold text-muted-foreground mb-2">Coming Soon</p>
                <p className="text-sm text-muted-foreground text-center max-w-xs">
                  Ground water level analysis and depth information will be available shortly
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Nearby Government Projects
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12">
                <Building2 className="h-16 w-16 text-pink-500/30 mb-4" />
                <p className="text-lg font-semibold text-muted-foreground mb-2">Coming Soon</p>
                <p className="text-sm text-muted-foreground text-center max-w-xs">
                  Information about nearby government infrastructure projects will be displayed here
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg border-0 mb-6">
          <CardHeader className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Infrastructure
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Navigation2 className="h-5 w-5 text-amber-600" />
                  <span className="font-medium">Roads</span>
                </div>
                <span className="text-sm font-semibold text-green-600">
                  {infrastructure.roads}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-amber-600" />
                  <span className="font-medium">Power</span>
                </div>
                <span className="text-sm font-semibold text-green-600">
                  {infrastructure.power}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Droplets className="h-5 w-5 text-amber-600" />
                  <span className="font-medium">Water</span>
                </div>
                <span className="text-sm font-semibold text-green-600">
                  {infrastructure.water}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Wifi className="h-5 w-5 text-amber-600" />
                  <span className="font-medium">Internet</span>
                </div>
                <span className="text-sm font-semibold text-green-600">
                  {infrastructure.internet}
                </span>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-border">
              <ScoreBadge score={scores.infrastructure} label="Infrastructure Score" className="w-full justify-center" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}