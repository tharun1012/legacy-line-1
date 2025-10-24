import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
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
  Award
} from "lucide-react";
import { supabase } from "@/Supabase/supabaseclient";
import { useEffect, useState } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

interface DetailedLandParcelAnalysisProps {
  parcelId: string;
  onBack: () => void;
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

export function DetailedLandParcelAnalysis({ parcelId, onBack }: DetailedLandParcelAnalysisProps) {
  const [parcelData, setParcelData] = useState<LandParcel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (parcelId) {
      fetchParcelData();
    } else {
      setError('No parcel ID provided');
      setLoading(false);
    }
  }, [parcelId]);

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
      
      let data = null;
      
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
    if (!parcelData) return { las: 0, vas: 0, overall: 0, infrastructureRating: 0 };

    const pricePerSqftStr = String(parcelData.price_per_sqft || '0');
    const pricePerSqft = parseFloat(pricePerSqftStr.replace(/[^0-9.-]/g, '') || '0');
    const area = parcelData.total_area || 0;
    
    let las = 6.0;
    const location = parcelData.location?.toLowerCase() || '';
    if (location.includes('devanahalli') || location.includes('airport')) las += 2.5;
    if (location.includes('whitefield') || location.includes('sarjapur')) las += 2.0;
    if (location.includes('electronic city')) las += 1.8;
    if (location.includes('bangalore')) las += 0.5;
    las = Math.min(9.5, las);
    
    let vas = 7.0;
    if (pricePerSqft < 5000) vas += 2.0;
    else if (pricePerSqft < 8000) vas += 1.0;
    if (area > 2000) vas += 0.5;
    vas = Math.min(9.5, vas);
    
    const overall = (las + vas) / 2;
    const infrastructureRating = las / 2;
    
    return {
      las: parseFloat(las.toFixed(1)),
      vas: parseFloat(vas.toFixed(1)),
      overall: parseFloat(overall.toFixed(1)),
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

  const infrastructure = {
    roads: { status: "Excellent", icon: CheckCircle, color: "text-green-600" },
    power: { status: "Connected", icon: CheckCircle, color: "text-green-600" },
    water: { status: "BWSSB", icon: CheckCircle, color: "text-green-600" },
    internet: { status: "Fiber Ready", icon: CheckCircle, color: "text-green-600" },
    drainage: { status: "Planned", icon: AlertTriangle, color: "text-yellow-600" }
  };

  const getAmenities = () => {
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
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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

  const scores = calculateScores();
  const pricing = calculatePricing();
  const distances = getDistances();
  const amenities = getAmenities();
  const lat = parcelData.latitude || 13.1986;
  const lng = parcelData.longitude || 77.7101;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header title="Detailed Land Parcel Analysis" showBackButton onBack={onBack} />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header Section */}
        <div className="mb-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <MapPin className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">
                {parcelData.property_name || 'Land Parcel'}
              </h1>
            </div>
            <p className="text-lg text-muted-foreground mb-2">
              {parcelData.location || 'Location not specified'}
            </p>
            <Badge variant="outline" className="text-sm px-3 py-1">
              Source: {parcelData.source || 'Unknown'}
            </Badge>
          </div>

          {/* Score Overview - Improved Design */}
          <Card className="shadow-xl border-0 bg-white">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                  <div className="flex items-center justify-center mb-2">
                    <Award className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="font-semibold text-sm text-gray-700">Overall</h3>
                  </div>
                  <div className="text-4xl font-bold text-blue-600 mb-1">
                    {scores.overall}
                  </div>
                  <p className="text-xs font-medium text-green-600">
                    {scores.overall >= 8 ? 'Excellent' : scores.overall >= 7 ? 'Good' : 'Fair'}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl">
                  <h3 className="font-semibold text-sm text-gray-700 mb-2">Rating</h3>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${
                          i < Math.floor(scores.infrastructureRating) 
                            ? 'text-yellow-500 fill-yellow-500' 
                            : 'text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>
                  <p className="text-sm font-semibold text-yellow-700">{scores.infrastructureRating}/5</p>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                  <h3 className="font-semibold text-sm text-gray-700 mb-2">Cost/sq ft</h3>
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    ₹{pricing.costPerSqm.toLocaleString()}
                  </div>
                  <p className="text-xs font-medium text-green-600">
                    {pricing.costPerSqm < 5000 ? 'Below Market' : 'Market Rate'}
                  </p>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                  <h3 className="font-semibold text-sm text-gray-700 mb-2">LAS Score</h3>
                  <div className="text-4xl font-bold text-purple-600">
                    {scores.las}
                  </div>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl">
                  <h3 className="font-semibold text-sm text-gray-700 mb-2">VAS Score</h3>
                  <div className="text-4xl font-bold text-teal-600">
                    {scores.vas}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Location Map */}
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Location Map
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-72 w-full rounded-b-lg overflow-hidden">
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

            {/* Investment Analysis */}
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Investment Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="text-sm font-medium text-gray-600">Plot Size</span>
                    <span className="font-semibold text-gray-900">{pricing.plotSize.toLocaleString()} sq ft</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="text-sm font-medium text-gray-600">Price per sq ft</span>
                    <span className="font-semibold text-gray-900">₹{pricing.costPerSqm.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="text-sm font-medium text-gray-600">Land Cost</span>
                    <span className="font-semibold text-gray-900">₹{(pricing.totalCost / 100000).toFixed(2)}L</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="text-sm font-medium text-gray-600">Registration (7%)</span>
                    <span className="font-semibold text-gray-900">₹{(pricing.registration / 100000).toFixed(2)}L</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200">
                    <span className="font-semibold text-blue-900">Total Investment</span>
                    <span className="text-xl font-bold text-blue-700">₹{(pricing.totalInvestment / 100000).toFixed(2)}L</span>
                  </div>
                </div>
                
               
{parcelData.url && (
  <Button 
    variant="outline" 
    className="w-full mt-4 hover:bg-primary hover:text-white transition-colors"
    onClick={() => window.open(parcelData.url, '_blank')}
  >
    View Original Listing
  </Button>
)} 
              </CardContent>
            </Card>

            {/* Distance Analysis */}
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Distance Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.values(distances).map((item: any, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                    <span className="font-semibold text-primary">{item.distance}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Infrastructure Status */}
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Infrastructure Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(infrastructure).map(([key, item]) => {
                  const Icon = item.icon;
                  return (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${item.color}`} />
                        <span className="font-medium capitalize text-gray-700">{key}</span>
                      </div>
                      <span className={`font-semibold ${item.color}`}>
                        {item.status}
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Transportation */}
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Transportation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {amenities.transportation.map((item: any, index: number) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">{item.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-primary">{item.distance}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Education */}
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Education & Healthcare</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {amenities.education.map((item: any, index: number) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">{item.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-primary">{item.distance}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Commercial */}
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Commercial</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {amenities.commercial.map((item: any, index: number) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">{item.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-primary">{item.distance}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button variant="outline" className="gap-2 hover:bg-gray-100" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            Print Report
          </Button>
          
          <Button variant="outline" onClick={onBack} className="gap-2 hover:bg-gray-100">
            <ArrowLeft className="h-4 w-4" />
            Back to Results
          </Button>
          
          <Button className="gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg">
            <Heart className="h-4 w-4" />
            Save to Favorites
          </Button>
        </div>
      </div>
    </div>
  );
}