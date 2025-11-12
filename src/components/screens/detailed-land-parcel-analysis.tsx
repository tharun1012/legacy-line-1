// DetailedLandParcelAnalysisWithAssessment.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/Supabase/supabaseclient";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { ScoreBadge } from "@/components/ui/score-badge";
import { Label } from "@/components/ui/label";
import { useLocation } from "react-router-dom";

import Map, { Marker, NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

// Icons
import {
  Star,
  Heart,
  Printer,
  ArrowLeft,
  Plane,
  Building2,
  School,
  Hospital,
  ShoppingCart,
  Banknote,
  Navigation2,
  AlertTriangle,
  CheckCircle,
  Loader2,
  MapPin,
  TrendingUp,
  Award,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  Shield,
  Brain,
  ChevronDown,
  Bus,
  GraduationCap,
  ShoppingBag,
  Zap,
  Droplets,
  Wifi,
  Download,
  Share2,
  Home,
  Waves
} from "lucide-react";

// Import the Free Risk Analysis service (No API keys required!)
import { FreeRiskAnalysisService, LandAnalysisResult, LocationData } from './GoogleEarthAIService';

// Create service instance
const googleEarthAIService = new FreeRiskAnalysisService();

// --- Collapsible Section (kept from earlier) ---
interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  icon: any;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({ title, subtitle, icon: Icon, children, defaultOpen = false }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className="shadow-sm border border-gray-200 mb-4">
      <div
        className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5 text-gray-700" />
            <div>
              <h2 className="text-lg font-bold text-gray-900">{title}</h2>
              {subtitle && <p className="text-sm text-gray-600 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <div className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            <ChevronDown className="h-5 w-5 text-gray-500" />
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="px-5 pb-5 pt-0 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </Card>
  );
}

// --- Types for parcel and assessment ---
interface DetailedLandParcelAnalysisProps {
  parcelId?: string;
  onBack?: () => void;
  data?: {
    googleMapLink: string;
    latitude: string;
    longitude: string;
  };
}


interface LandParcel {
  id: string;
  property_name: string;
  property_type: string;
  location: string;
  url: string;
  total_area: number;
  total_price: string;
  price_per_sqft: string;
  source: string;
  latitude: number | null;
  longitude: number | null;
}

// --- Assessment types ---
interface AssessmentData {
  googleMapLink: string;
  latitude: string;
  longitude: string;
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

// --- Constants for residential REST (copied from your dashboard) ---
const SUPABASE_URL = "https://mowugexywvklirxwzpdh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vd3VnZXh5d3ZrbGlyeHd6cGRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyOTYzOTEsImV4cCI6MjA3NDg3MjM5MX0.eJnBHRcnZ-3MPw9HYgGPXSfuAT_QnuarmOI2ogaCQeg";

// --- Utility functions for assessment ---
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
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    const elements = data.elements || [];
    
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

// --- Main merged component ---
export function DetailedLandParcelAnalysis({ parcelId, onBack }: DetailedLandParcelAnalysisProps) {
    const location = useLocation();
  const passedData = location.state as
    | { googleMapLink: string; latitude: string; longitude: string }
    | undefined;

  // If the user navigated from "Continue to Assessment"
  useEffect(() => {
    if (passedData?.latitude && passedData?.longitude) {
      setParcelData({
        id: "manual",
        property_name: "User Selected Land Parcel",
        property_type: "Custom Entry",
        location: "Coordinates provided by user",
        url: passedData.googleMapLink,
        total_area: 2400,
        total_price: "₹75,00,000",
        price_per_sqft: "₹3125",
        source: "Manual Entry",
        latitude: parseFloat(passedData.latitude),
        longitude: parseFloat(passedData.longitude),
      });
      setLoading(false);
    }
  }, [passedData]);

  // Parcel states (existing)
  const [parcelData, setParcelData] = useState<LandParcel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Risk Analysis state (existing)
  const [riskAnalysis, setRiskAnalysis] = useState<LandAnalysisResult | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Assessment states (merged)
  const [educationalRadius, setEducationalRadius] = useState("5");
  const [commercialRadius, setCommercialRadius] = useState("5");
  const [waterBodiesRadius, setWaterBodiesRadius] = useState("5");
  const [transportRadius, setTransportRadius] = useState("5");
  
  const [expandedSections, setExpandedSections] = useState({
    education: false,
    commercial: false,
    water: false,
    transport: false,
    residential: false,
    groundwater: false,
    government: false,
    infrastructure: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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

  // --- existing useEffects to fetch parcel + risk analysis ---
  useEffect(() => {
  if (passedData?.latitude && passedData?.longitude) {
    // Skip Supabase fetch — handled by user input above
    return;
  }
  if (parcelId) {
    fetchParcelData();
  } else {
    setError('No parcel ID provided');
    setLoading(false);
  }
}, [parcelId, passedData]);


  // When parcel loaded, trigger assessment & risk analysis fetches
  useEffect(() => {
    if (parcelData && parcelData.latitude && parcelData.longitude) {
      fetchRiskAnalysis();
      // kick off assessment fetches
      const lat = parcelData.latitude;
      const lng = parcelData.longitude;

      // Residential projects
      setLoadingResidential(true);
      fetchResidentialProjects(lat, lng).then(projects => {
        setResidentialProjects(projects);
        setLoadingResidential(false);
      }).catch(() => setLoadingResidential(false));

      // Educational
      setLoadingEducational(true);
      fetchNearbyPlaces(lat, lng, 5, ['amenity=school', 'amenity=college', 'amenity=university', 'amenity=kindergarten', 'building=school', 'building=university']).then(data => {
        setEducationalDataFull(data);
        setEducationalData(data.filter(place => place.distance <= parseFloat(educationalRadius)));
        setLoadingEducational(false);
      }).catch(() => {
        setEducationalDataFull([]);
        setEducationalData([]);
        setLoadingEducational(false);
      });

      // Commercial
      setLoadingCommercial(true);
      fetchNearbyPlaces(lat, lng, 5, ['shop=mall', 'shop=supermarket', 'amenity=marketplace', 'shop=department_store', 'building=commercial', 'building=retail', 'shop=convenience']).then(data => {
        setCommercialDataFull(data);
        setCommercialData(data.filter(place => place.distance <= parseFloat(commercialRadius)));
        setLoadingCommercial(false);
      }).catch(() => {
        setCommercialDataFull([]);
        setCommercialData([]);
        setLoadingCommercial(false);
      });

      // Water
      setLoadingWater(true);
      fetchNearbyPlaces(lat, lng, 5, ['natural=water', 'water=lake', 'water=river', 'water=reservoir', 'water=pond', 'water=canal', 'waterway=river']).then(data => {
        setWaterBodiesDataFull(data);
        setWaterBodiesData(data.filter(place => place.distance <= parseFloat(waterBodiesRadius)));
        setLoadingWater(false);
      }).catch(() => {
        setWaterBodiesDataFull([]);
        setWaterBodiesData([]);
        setLoadingWater(false);
      });

      // Transport
      setLoadingTransport(true);
      fetchNearbyPlaces(lat, lng, 5, ['highway=bus_stop', 'amenity=bus_station', 'railway=station', 'railway=halt', 'railway=tram_stop', 'public_transport=station', 'public_transport=stop_position', 'aeroway=aerodrome', 'aeroway=terminal', 'amenity=taxi', 'amenity=ferry_terminal']).then(data => {
        setTransportDataFull(data);
        setTransportData(data.filter(place => place.distance <= parseFloat(transportRadius)));
        setLoadingTransport(false);
      }).catch(() => {
        setTransportDataFull([]);
        setTransportData([]);
        setLoadingTransport(false);
      });
    }
  }, [parcelData]); // only when parcelData changes

  // Update filtered lists when radii change
  useEffect(() => {
    const radius = parseFloat(educationalRadius);
    const filtered = educationalDataFull.filter(place => place.distance <= radius);
    setEducationalData(filtered);
  }, [educationalRadius, educationalDataFull]);

  useEffect(() => {
    const radius = parseFloat(commercialRadius);
    const filtered = commercialDataFull.filter(place => place.distance <= radius);
    setCommercialData(filtered);
  }, [commercialRadius, commercialDataFull]);

  useEffect(() => {
    const radius = parseFloat(waterBodiesRadius);
    const filtered = waterBodiesDataFull.filter(place => place.distance <= radius);
    setWaterBodiesData(filtered);
  }, [waterBodiesRadius, waterBodiesDataFull]);

  useEffect(() => {
    const radius = parseFloat(transportRadius);
    const filtered = transportDataFull.filter(place => place.distance <= radius);
    setTransportData(filtered);
  }, [transportRadius, transportDataFull]);

  // Combine scores to overall
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

  // --- existing fetches + helpers from the original DetailedLandParcelAnalysis component ---
  const fetchRiskAnalysis = async () => {
    if (!parcelData) return;
    
    setAnalysisLoading(true);
    setAnalysisError(null);
    
    try {
      const pricePerSqftStr = String(parcelData.price_per_sqft || '0');
      const pricePerSqft = parseFloat(pricePerSqftStr.replace(/[^0-9.-]/g, '') || '0');
      
      const locationData: LocationData = {
        latitude: parcelData.latitude || 13.1986,
        longitude: parcelData.longitude || 77.7101,
        locationName: parcelData.location || 'Bangalore',
        area: parcelData.total_area,
        pricePerSqft: pricePerSqft
      };
      
      const result = await googleEarthAIService.analyzeLandParcel(locationData);
      setRiskAnalysis(result);
    } catch (err: any) {
      console.error('Error fetching risk analysis:', err);
      setAnalysisError(err.message || 'Failed to load risk analysis');
    } finally {
      setAnalysisLoading(false);
    }
  };

  const fetchParcelData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('=== FETCHING PARCEL DATA ===');
      console.log('Parcel ID:', parcelId);
      console.log('Parcel ID type:', typeof parcelId);
      
      const { data: allData } = await supabase
        .from('landdetails')
        .select('*')
        .limit(5);
      
      console.log('Sample of all data:', allData);
      console.log('Sample data structure:', allData?.[0]);
      console.log('Available columns:', allData?.[0] ? Object.keys(allData[0]) : 'No data');
      
      let data: any = null;
      
      console.log('Strategy 1: Trying with id field...');
      const result1 = await supabase
        .from('landdetails')
        .select('*')
        .eq('id', parcelId);
      
      console.log('Strategy 1 result:', result1.data);
      
      if (result1.data && result1.data.length > 0) {
        data = result1.data[0];
        console.log('✓ Found with id field');
      }
      
      if (!data) {
        console.log('Strategy 2: Trying with property_name...');
        const result2 = await supabase
          .from('landdetails')
          .select('*')
          .eq('property_name', parcelId);
        
        console.log('Strategy 2 result:', result2.data);
        
        if (result2.data && result2.data.length > 0) {
          data = result2.data[0];
          console.log('✓ Found with property_name');
        }
      }
      
      if (!data && !isNaN(Number(parcelId))) {
        console.log('Strategy 3: Trying with numeric id...');
        const result3 = await supabase
          .from('landdetails')
          .select('*')
          .eq('id', Number(parcelId));
        
        console.log('Strategy 3 result:', result3.data);
        
        if (result3.data && result3.data.length > 0) {
          data = result3.data[0];
          console.log('✓ Found with numeric id');
        }
      }

      if (!data) {
        console.error('All strategies failed. No data found.');
        throw new Error(`No parcel found with identifier: ${parcelId}`);
      }
      
      console.log('Successfully fetched parcel data:', data);
      setParcelData(data);
    } catch (err: any) {
      console.error('Error fetching parcel data:', err);
      setError(err.message || 'Failed to load parcel details');
    } finally {
      setLoading(false);
    }
  };

  const calculateScores = () => {
    if (!parcelData) return { overall: 0, infrastructureRating: 0 };

    const pricePerSqftStr = String(parcelData.price_per_sqft || '0');
    const pricePerSqft = parseFloat(pricePerSqftStr.replace(/[^0-9.-]/g, '') || '0');
    const area = parcelData.total_area || 0;
    
    let score = 7.0;
    const location = parcelData.location?.toLowerCase() || '';
    if (location.includes('devanahalli') || location.includes('airport')) score += 2.0;
    if (location.includes('whitefield') || location.includes('sarjapur')) score += 1.5;
    if (location.includes('electronic city')) score += 1.2;
    if (pricePerSqft < 5000) score += 1.0;
    else if (pricePerSqft < 8000) score += 0.5;
    if (area > 2000) score += 0.3;
    score = Math.min(9.5, score);
    
    const infrastructureRating = score / 2;
    
    return {
      overall: parseFloat(score.toFixed(1)),
      infrastructureRating: parseFloat(infrastructureRating.toFixed(1))
    };
  };

  const calculatePricing = () => {
    if (!parcelData) return { costPerSqm: 0, plotSize: 0, totalCost: 0, registration: 0, totalInvestment: 0 };

    const pricePerSqftStr = String(parcelData.price_per_sqft || '0');
    const totalPriceStr = String(parcelData.total_price || '0');
    
    const pricePerSqft = parseFloat(pricePerSqftStr.replace(/[^0-9.-]/g, '') || '0');
    const totalCost = parseFloat(totalPriceStr.replace(/[^0-9.-]/g, '') || '0');
    const plotSize = parcelData.total_area || 0;
    const registration = Math.round(totalCost * 0.07);
    const totalInvestment = totalCost + registration;

    return {
      costPerSqm: Math.round(pricePerSqft),
      plotSize,
      totalCost,
      registration,
      totalInvestment
    };
  };

  const getDistances = () => {
    if (!parcelData) return {};
    
    const location = parcelData.location?.toLowerCase() || '';
    
    if (location.includes('devanahalli')) {
      return {
        airport: { name: "Kempegowda International Airport", distance: "12.5 km" },
        prestige: { name: "Prestige Lakeside Habitat", distance: "8.2 km" },
        businessPark: { name: "Devanahalli Business Park", distance: "3.1 km" },
        town: { name: "Devanahalli Town", distance: "4.1 km" },
        city: { name: "Bangalore City Center", distance: "52.0 km" }
      };
    } else if (location.includes('whitefield')) {
      return {
        airport: { name: "Kempegowda International Airport", distance: "45.0 km" },
        prestige: { name: "Prestige Tech Park", distance: "5.2 km" },
        businessPark: { name: "Whitefield IT Hub", distance: "2.1 km" },
        town: { name: "Whitefield Main Road", distance: "3.1 km" },
        city: { name: "Bangalore City Center", distance: "22.0 km" }
      };
    } else {
      return {
        airport: { name: "Kempegowda International Airport", distance: "35.0 km" },
        prestige: { name: "Nearby IT Park", distance: "8.0 km" },
        businessPark: { name: "Business District", distance: "5.0 km" },
        town: { name: "Town Center", distance: "6.0 km" },
        city: { name: "Bangalore City Center", distance: "25.0 km" }
      };
    }
  };

  const infrastructureStatic = {
    roads: { status: "Excellent", icon: CheckCircle, color: "text-green-600" },
    power: { status: "Connected", icon: CheckCircle, color: "text-green-600" },
    water: { status: "BWSSB", icon: CheckCircle, color: "text-green-600" },
    internet: { status: "Fiber Ready", icon: CheckCircle, color: "text-green-600" },
    drainage: { status: "Planned", icon: AlertTriangle, color: "text-yellow-600" }
  };

  // --- small render helpers for assessment lists ---
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

  // --- loading / error UI from original file ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Detailed Land Parcel Analysis" showBackButton onBack={onBack} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground">Loading parcel details...</p>
            <p className="text-sm text-muted-foreground mt-2">Please wait</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !parcelData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Detailed Land Parcel Analysis" showBackButton onBack={onBack} />
        <div className="flex items-center justify-center min-h-[70vh] px-4">
          <Card className="p-8 text-center max-w-md shadow-xl">
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-3">Failed to Load Parcel</h3>
            <p className="text-destructive mb-6">{error || 'Parcel not found'}</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={onBack} size="lg">Back to Results</Button>
              <Button variant="outline" onClick={fetchParcelData} size="lg">Retry</Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // --- compute derived data for display ---
  const scoresLocal = calculateScores();
  const pricing = calculatePricing();
  const distances = getDistances();
  const amenities = (function getAmenities() {
    if (!parcelData) return { transportation: [], education: [], commercial: [] };
    
    const location = parcelData.location?.toLowerCase() || '';
    
    if (location.includes('devanahalli')) {
      return {
        transportation: [
          { name: "Airport", distance: "12.5 km", icon: Plane },
          { name: "Bus Stand", distance: "4.2 km", icon: Navigation2 },
          { name: "Railway Station", distance: "8.5 km", icon: Navigation2 },
          { name: "Highway Access", distance: "3.1 km", icon: Navigation2 }
        ],
        education: [
          { name: "School", distance: "5.2 km", icon: School },
          { name: "College", distance: "7.8 km", icon: School },
          { name: "Medical Facility", distance: "4.6 km", icon: Hospital },
          { name: "Hospital", distance: "6.3 km", icon: Hospital }
        ],
        commercial: [
          { name: "Business Park", distance: "3.1 km", icon: Building2 },
          { name: "Shopping Complex", distance: "4.5 km", icon: ShoppingCart },
          { name: "Supermarket", distance: "3.8 km", icon: ShoppingCart },
          { name: "ATM/Banks", distance: "4.1 km", icon: Banknote }
        ]
      };
    } else if (location.includes('whitefield')) {
      return {
        transportation: [
          { name: "Airport", distance: "45.2 km", icon: Plane },
          { name: "Bus Stand", distance: "5.1 km", icon: Navigation2 },
          { name: "Railway Station", distance: "9.3 km", icon: Navigation2 },
          { name: "Highway Access", distance: "4.2 km", icon: Navigation2 }
        ],
        education: [
          { name: "School", distance: "4.8 km", icon: School },
          { name: "College", distance: "8.2 km", icon: School },
          { name: "Medical Facility", distance: "5.1 km", icon: Hospital },
          { name: "Hospital", distance: "7.4 km", icon: Hospital }
        ],
        commercial: [
          { name: "Business Park", distance: "2.1 km", icon: Building2 },
          { name: "Shopping Complex", distance: "3.9 km", icon: ShoppingCart },
          { name: "Supermarket", distance: "3.2 km", icon: ShoppingCart },
          { name: "ATM/Banks", distance: "3.5 km", icon: Banknote }
        ]
      };
    } else {
      return {
        transportation: [
          { name: "Airport", distance: "35.7 km", icon: Plane },
          { name: "Bus Stand", distance: "5.5 km", icon: Navigation2 },
          { name: "Railway Station", distance: "8.9 km", icon: Navigation2 },
          { name: "Highway Access", distance: "4.8 km", icon: Navigation2 }
        ],
        education: [
          { name: "School", distance: "5.0 km", icon: School },
          { name: "College", distance: "8.0 km", icon: School },
          { name: "Medical Facility", distance: "4.5 km", icon: Hospital },
          { name: "Hospital", distance: "6.0 km", icon: Hospital }
        ],
        commercial: [
          { name: "Business Park", distance: "5.0 km", icon: Building2 },
          { name: "Shopping Complex", distance: "4.0 km", icon: ShoppingCart },
          { name: "Supermarket", distance: "3.4 km", icon: ShoppingCart },
          { name: "ATM/Banks", distance: "4.0 km", icon: Banknote }
        ]
      };
    }
  })();

  const lat = parcelData.latitude || 13.1986;
  const lng = parcelData.longitude || 77.7101;

  // --- final render (merged page) ---
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Detailed Land Parcel Analysis" showBackButton onBack={onBack} />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header Section */}
        <div className="mb-6">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <MapPin className="h-5 w-5 text-gray-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                {parcelData.property_name || 'Land Parcel'}
              </h1>
            </div>
            <p className="text-base text-gray-600 mb-3">
              {parcelData.location || 'Location not specified'}
            </p>
            <Badge variant="outline" className="text-sm px-3 py-1">
              Source: {parcelData.source || 'Unknown'}
            </Badge>
          </div>

          {/* Map at top center */}
          <div className="flex justify-center mb-6">
            <Card className="shadow-sm border border-gray-200 w-full max-w-3xl">
              <CardContent className="p-0">
                <div className="h-80 w-full rounded-lg overflow-hidden">
                  <Map
                    initialViewState={{
                      longitude: lng,
                      latitude: lat,
                      zoom: 13,
                    }}
                    style={{ width: "100%", height: "100%" }}
                    mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                  >
                    <NavigationControl position="top-right" />
                    <Marker longitude={lng} latitude={lat} color="#ef4444" />
                  </Map>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Score Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="shadow-sm border border-gray-200 bg-white hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-gray-600">Overall Score</h3>
                  <Award className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {scoresLocal.overall}
                </div>
                <p className="text-xs text-gray-500">
                  {scoresLocal.overall >= 8 ? 'Excellent' : scoresLocal.overall >= 7 ? 'Good' : 'Fair'}
                </p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border border-gray-200 bg-white hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-gray-600">Rating</h3>
                  <Star className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${
                        i < Math.floor(scoresLocal.infrastructureRating) 
                          ? 'text-yellow-500 fill-yellow-500' 
                          : 'text-gray-300'
                      }`} 
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500">{scoresLocal.infrastructureRating} out of 5</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-gray-200 bg-white hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-gray-600">Cost/sq ft</h3>
                  <Banknote className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  ₹{pricing.costPerSqm.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500">
                  {pricing.costPerSqm < 5000 ? 'Below Market' : 'Market Rate'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Investment Summary */}
        <Card className="shadow-sm border border-gray-200 mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-gray-700" />
              <div>
                <CardTitle className="text-lg font-bold text-gray-900">Investment Summary</CardTitle>
                <p className="text-sm text-gray-600 mt-0.5">Key metrics and projections</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-900">Plot Size</span>
                </div>
                <div className="text-2xl font-bold text-blue-900 mb-1">
                  {pricing.plotSize.toLocaleString()}
                </div>
                <p className="text-xs text-blue-700">sq ft</p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Banknote className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-medium text-green-900">Current Rate</span>
                </div>
                <div className="text-2xl font-bold text-green-900 mb-1">
                  ₹{pricing.costPerSqm.toLocaleString()}
                </div>
                <p className="text-xs text-green-700">per sq ft</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <span className="text-xs font-medium text-purple-900">Projected Rate (3 yrs)</span>
                </div>
                <div className="text-2xl font-bold text-purple-900 mb-1">
                  ₹{Math.round(pricing.costPerSqm * 1.35).toLocaleString()}
                </div>
                <p className="text-xs text-purple-700">
                  <span className="font-semibold">+35%</span> growth expected
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Land Cost:</span>
                  <div className="font-semibold text-gray-900">₹{(pricing.totalCost / 100000).toFixed(2)}L</div>
                </div>
                <div>
                  <span className="text-gray-600">Registration:</span>
                  <div className="font-semibold text-gray-900">₹{(pricing.registration / 100000).toFixed(2)}L</div>
                </div>
                <div>
                  <span className="text-gray-600">Total Investment:</span>
                  <div className="font-bold text-blue-900">₹{(pricing.totalInvestment / 100000).toFixed(2)}L</div>
                </div>
                <div>
                  <span className="text-gray-600">Projected Value:</span>
                  <div className="font-bold text-purple-900">₹{((pricing.totalCost * 1.35) / 100000).toFixed(2)}L</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI-Powered Risk Analysis */}
        <CollapsibleSection
          title="AI-Powered Risk Analysis"
          subtitle="Powered by Google Earth AI"
          icon={Brain}
          defaultOpen={true}
        >
          {analysisLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mx-auto mb-3" />
              <p className="text-sm text-gray-600">Analyzing location with AI...</p>
            </div>
          ) : analysisError ? (
            <div className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
              <p className="text-red-600 mb-4">{analysisError}</p>
              <Button onClick={fetchRiskAnalysis} variant="outline">
                Retry Analysis
              </Button>
            </div>
          ) : riskAnalysis ? (
            <div className="space-y-4">
              {/* Reasons to Buy */}
              <div className="border border-gray-200 rounded-lg p-5 bg-white">
                <h3 className="text-base font-semibold flex items-center gap-2 mb-4">
                  <ThumbsUp className="h-5 w-5 text-green-600" />
                  Reasons to Buy
                </h3>
                <ul className="space-y-3">
                  {riskAnalysis.pros.map((pro, idx) => (
                    <li key={idx} className="flex gap-3 text-sm text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Risks & Concerns */}
              <div className="border border-gray-200 rounded-lg p-5 bg-white">
                <h3 className="text-base font-semibold flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Risks & Concerns
                </h3>
                <ul className="space-y-3">
                  {riskAnalysis.cons.map((con, idx) => (
                    <li key={idx} className="flex gap-3 text-sm text-gray-700">
                      <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div className="border border-gray-200 rounded-lg p-5 bg-white">
                <h3 className="text-base font-semibold flex items-center gap-2 mb-4">
                  <Lightbulb className="h-5 w-5 text-blue-600" />
                  Recommendations
                </h3>
                <ul className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                  {riskAnalysis.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex gap-3 text-sm text-gray-700">
                      <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
                
                {/* Risk Level & Confidence */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-gray-700" />
                      <span className="text-sm font-medium text-gray-700">Risk Level</span>
                    </div>
                    <span className={`text-sm font-semibold ${
                      riskAnalysis.riskLevel === 'Low' ? 'text-green-600' :
                      riskAnalysis.riskLevel === 'Medium' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {riskAnalysis.riskLevel}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-gray-700" />
                      <span className="text-sm font-medium text-gray-700">AI Confidence</span>
                    </div>
                    <span className="text-base font-bold text-blue-600">
                      {riskAnalysis.confidence}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </CollapsibleSection>

        {/* Location & Distances */}
        <CollapsibleSection title="Location & Key Distances" icon={MapPin}>
          <div className="space-y-3">
            {distances.airport && (
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-2">
                  <Plane className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{distances.airport.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{distances.airport.distance}</span>
              </div>
            )}
            {distances.businessPark && (
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{distances.businessPark.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{distances.businessPark.distance}</span>
              </div>
            )}
            {distances.prestige && (
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{distances.prestige.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{distances.prestige.distance}</span>
              </div>
            )}
            {distances.town && (
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{distances.town.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{distances.town.distance}</span>
              </div>
            )}
            {distances.city && (
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{distances.city.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{distances.city.distance}</span>
              </div>
            )}
          </div>
        </CollapsibleSection>

        {/* Nearby Transportation (kept as in original) */}
        <CollapsibleSection title="Nearby Transportation" icon={ShoppingCart}>
          <div className="space-y-4">
            {/* Transportation */}
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Navigation2 className="h-4 w-4" />
              </h3>
              <div className="space-y-2">
                {amenities.transportation.map((item, idx) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4 text-gray-600" />
                        <span className="text-sm text-gray-700">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{item.distance}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* =========================
            Assessment Dashboard Sections
            (Inserted immediately after Nearby Transportation)
           ========================= */}

        <div className="space-y-4 mt-6">
          {/* Educational Institutions */}
          <Card className="shadow-lg border-0 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 cursor-pointer hover:from-purple-600 hover:to-purple-700 transition-all"
              onClick={() => toggleSection('education')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-5 w-5" />
                  <h3 className="font-semibold text-lg">Educational Institutions</h3>
                </div>
                <div className="flex items-center gap-4">
                  {expandedSections.education && (
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Label htmlFor="edu-radius" className="text-sm text-white/90">Radius:</Label>
                      <select
                        id="edu-radius"
                        value={educationalRadius}
                        onChange={(e) => setEducationalRadius(e.target.value)}
                        className="bg-white/20 text-white border border-white/30 rounded-md px-3 py-1.5 text-sm backdrop-blur-sm cursor-pointer hover:bg-white/30 transition-colors"
                      >
                        {radiusOptions.map(opt => (
                          <option key={opt.value} value={opt.value} className="text-slate-800 bg-white">{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.education ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </div>
            {expandedSections.education && (
              <CardContent className="pt-6">
                {renderPlacesList(educationalData, loadingEducational, GraduationCap)}
                <div className="pt-4 mt-4 border-t">
                  <ScoreBadge score={scores.education} label="Education Score" className="w-full justify-center" />
                </div>
              </CardContent>
            )}
          </Card>

          {/* Commercial Buildings */}
          <Card className="shadow-lg border-0 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 cursor-pointer hover:from-orange-600 hover:to-orange-700 transition-all"
              onClick={() => toggleSection('commercial')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="h-5 w-5" />
                  <h3 className="font-semibold text-lg">Commercial Buildings</h3>
                </div>
                <div className="flex items-center gap-4">
                  {expandedSections.commercial && (
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Label htmlFor="commercial-radius" className="text-sm text-white/90">Radius:</Label>
                      <select
                        id="commercial-radius"
                        value={commercialRadius}
                        onChange={(e) => setCommercialRadius(e.target.value)}
                        className="bg-white/20 text-white border border-white/30 rounded-md px-3 py-1.5 text-sm backdrop-blur-sm cursor-pointer hover:bg-white/30 transition-colors"
                      >
                        {radiusOptions.map(opt => (
                          <option key={opt.value} value={opt.value} className="text-slate-800 bg-white">{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.commercial ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </div>
            {expandedSections.commercial && (
              <CardContent className="pt-6">
                {renderPlacesList(commercialData, loadingCommercial, ShoppingBag)}
                <div className="pt-4 mt-4 border-t">
                  <ScoreBadge score={scores.commercial} label="Commercial Score" className="w-full justify-center" />
                </div>
              </CardContent>
            )}
          </Card>

          {/* Water Bodies */}
          <Card className="shadow-lg border-0 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white p-4 cursor-pointer hover:from-cyan-600 hover:to-cyan-700 transition-all"
              onClick={() => toggleSection('water')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Droplets className="h-5 w-5" />
                  <h3 className="font-semibold text-lg">Water Bodies</h3>
                </div>
                <div className="flex items-center gap-4">
                  {expandedSections.water && (
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Label htmlFor="water-radius" className="text-sm text-white/90">Radius:</Label>
                      <select
                        id="water-radius"
                        value={waterBodiesRadius}
                        onChange={(e) => setWaterBodiesRadius(e.target.value)}
                        className="bg-white/20 text-white border border-white/30 rounded-md px-3 py-1.5 text-sm backdrop-blur-sm cursor-pointer hover:bg-white/30 transition-colors"
                      >
                        {radiusOptions.map(opt => (
                          <option key={opt.value} value={opt.value} className="text-slate-800 bg-white">{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.water ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </div>
            {expandedSections.water && (
              <CardContent className="pt-6">
                {renderPlacesList(waterBodiesData, loadingWater, Droplets)}
                <div className="pt-4 mt-4 border-t">
                  <ScoreBadge score={scores.water} label="Water Bodies Score" className="w-full justify-center" />
                </div>
              </CardContent>
            )}
          </Card>

          {/* Transportation Hub */}
          <Card className="shadow-lg border-0 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-4 cursor-pointer hover:from-indigo-600 hover:to-indigo-700 transition-all"
              onClick={() => toggleSection('transport')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bus className="h-5 w-5" />
                  <h3 className="font-semibold text-lg">Transportation Hub</h3>
                </div>
                <div className="flex items-center gap-4">
                  {expandedSections.transport && (
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Label htmlFor="transport-radius" className="text-sm text-white/90">Radius:</Label>
                      <select
                        id="transport-radius"
                        value={transportRadius}
                        onChange={(e) => setTransportRadius(e.target.value)}
                        className="bg-white/20 text-white border border-white/30 rounded-md px-3 py-1.5 text-sm backdrop-blur-sm cursor-pointer hover:bg-white/30 transition-colors"
                      >
                        {radiusOptions.map(opt => (
                          <option key={opt.value} value={opt.value} className="text-slate-800 bg-white">{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.transport ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </div>
            {expandedSections.transport && (
              <CardContent className="pt-6">
                {renderPlacesList(transportData, loadingTransport, Bus)}
                <div className="pt-4 mt-4 border-t">
                  <ScoreBadge score={scores.transport} label="Transport Score" className="w-full justify-center" />
                </div>
              </CardContent>
            )}
          </Card>

          {/* Residential Projects */}
          <Card className="shadow-lg border-0 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 cursor-pointer hover:from-green-600 hover:to-green-700 transition-all"
              onClick={() => toggleSection('residential')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Home className="h-5 w-5" />
                  <h3 className="font-semibold text-lg">Nearby Residential Projects</h3>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-white/90">Within 5 km radius</span>
                  <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.residential ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </div>
            {expandedSections.residential && (
              <CardContent className="pt-6">
                {renderResidentialProjects()}
                <div className="pt-4 mt-4 border-t">
                  <ScoreBadge score={scores.residential} label="Residential Score" className="w-full justify-center" />
                </div>
              </CardContent>
            )}
          </Card>

          {/* Ground Water Levels */}
          <Card className="shadow-lg border-0 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all"
              onClick={() => toggleSection('groundwater')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Waves className="h-5 w-5" />
                  <h3 className="font-semibold text-lg">Ground Water Levels</h3>
                </div>
                <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.groundwater ? 'rotate-180' : ''}`} />
              </div>
            </div>
            {expandedSections.groundwater && (
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-12">
                  <Waves className="h-16 w-16 text-blue-500/30 mb-4" />
                  <p className="text-lg font-semibold text-muted-foreground mb-2">Coming Soon</p>
                  <p className="text-sm text-muted-foreground text-center max-w-xs">
                    Ground water level analysis and depth information will be available shortly
                  </p>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Nearby Government Projects */}
          <Card className="shadow-lg border-0 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-pink-500 to-pink-600 text-white p-4 cursor-pointer hover:from-pink-600 hover:to-pink-700 transition-all"
              onClick={() => toggleSection('government')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5" />
                  <h3 className="font-semibold text-lg">Nearby Government Projects</h3>
                </div>
                <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.government ? 'rotate-180' : ''}`} />
              </div>
            </div>
            {expandedSections.government && (
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-12">
                  <Building2 className="h-16 w-16 text-pink-500/30 mb-4" />
                  <p className="text-lg font-semibold text-muted-foreground mb-2">Coming Soon</p>
                  <p className="text-sm text-muted-foreground text-center max-w-xs">
                    Information about nearby government infrastructure projects will be displayed here
                  </p>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Infrastructure */}
          <Card className="shadow-lg border-0 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-4 cursor-pointer hover:from-amber-600 hover:to-amber-700 transition-all"
              onClick={() => toggleSection('infrastructure')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5" />
                  <h3 className="font-semibold text-lg">Infrastructure</h3>
                </div>
                <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.infrastructure ? 'rotate-180' : ''}`} />
              </div>
            </div>
            {expandedSections.infrastructure && (
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
                <div className="pt-4 mt-4 border-t">
                  <ScoreBadge score={scores.infrastructure} label="Infrastructure Score" className="w-full justify-center" />
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Action Buttons (kept at bottom) */}
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Button 
            onClick={onBack} 
            variant="outline" 
            size="lg"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Results
          </Button>
          
          <Button 
            onClick={() => window.open(parcelData.url, '_blank')} 
            size="lg"
            className="gap-2"
          >
            View Original Listing
          </Button>
          
          <Button 
            onClick={() => window.print()} 
            variant="outline" 
            size="lg"
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            Print Report
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            className="gap-2"
          >
            <Heart className="h-4 w-4" />
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
