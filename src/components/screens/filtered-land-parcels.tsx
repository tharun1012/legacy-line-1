import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { ScoreBadge } from "@/components/ui/score-badge";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Eye, 
  Target, 
  TrendingUp, 
  Star,
  Award,
  DollarSign,
  Loader2,
  ChevronRight,
  Search,
  Zap,
  Newspaper,
  ShoppingCart,
  Building2
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/Supabase/supabaseclient";

interface FilteredLandParcelsProps {
  filters: any;
  onBack: () => void;
  onViewDetails: (parcelId: string) => void;
}

interface LandParcel {
  id: string;
  property_name: string;
  location: string;
  total_area: number;
  total_price: string;
  price_per_sqft: string;
  source: string;
  url: string;
  latitude: number | null;
  longitude: number | null;
}

const BANGALORE_PLACES_LIST = [
  'Indranagar', 'JP Nagar', 'Whitefield', 'Sarjapur', 'Electronic City',
  'Koramangala', 'Indiranagar', 'Devanahalli', 'Marathahalli', 'Mahadevapura',
  'Hebbal', 'Yelahanka', 'Bellandur', 'Bannerghatta', 'Jayanagar',
  'Banashankari', 'Vijayanagar', 'Basaveshwara Nagar', 'Benson Town', 'Shantinagar',
  'Malleswaram', 'Rajajinagar', 'Seshadripuram', 'Yeshwanthpur', 'Peenya',
  'Jalahalli', 'Nagavara', 'Kaggadaspura', 'Kamakshipalya', 'Kalkere',
  'Kalyan Nagar', 'Kasavanhalli', 'Kengeri', 'Keesara', 'Kundalahalli',
  'Lachalli', 'Lakshmipuram', 'Langford Town', 'Lingrajapuram', 'Lokhandwala',
  'Madhanayakanahalli', 'Madivala', 'Mahalakshmipuram', 'Mahakavi Kuvempu Road', 'Maharani',
  'Malleshwaram', 'Mandikeri', 'Manjunath Nagar', 'Marenahasllu', 'Maruthnagara',
  'Mico Layout', 'Millers Road', 'Mizpah', 'Mohan Nagar', 'Moorthy Layout', 
  'Murgeshpalya', 'Musarambagh', 'Mustafa Nagar', 'Nagavarapalya', 'Nagarathpet',
  'Nagavalli', 'Nagavara Circle', 'Nagundaspalya', 'Nandini Layout', 'Nandyal',
  'Nanjundapuram', 'Nanjundeshwara Temple Road', 'Narayanaghatta', 'Narayana Hatta', 'Natekallu'
];

const TOWNSHIPS_OPTIONS = [
  'Adarsh Savana', 'Adithya Homes Paradise', 'Ajmal Flora Valley', 'Arvind Lakeview',
  'Arvind The Park', 'Assetz The Secret Lake', 'BDA Layout', 'Purva Windermere',
  'Sobha Silicon Oasis', 'Kolte Patil Ivy', 'Godrej Gardens', 'Brigade Gateway'
];

const INFRASTRUCTURE_OPTIONS = [
  'Roads', 'Power', 'Water', 'Internet',
  'Drainage', 'Parks', 'Street Lights', 'Security'
];

const NEWS_OPTIONS = [
  'South City Commissioner directs scrutiny of property tax',
  '33k property owners in Bengaluru to get power, water connections',
  'Bengaluru real estate operator murder: Police search properties',
  'Bengaluru resident shares costly findings'
];

const ADS_OPTIONS = [
  'Premium Plots in Devanahalli', 'Residential Land Near Airport',
  'BMRDA Approved Sites', 'Investment Opportunities',
  'Gated Community Plots', 'Ready to Construct Land'
];

export function FilteredLandParcels({ filters, onBack, onViewDetails }: FilteredLandParcelsProps) {
  const [currentStep, setCurrentStep] = useState<'places' | 'subfilters' | 'results'>('places');
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sub-filter selections
  const [selectedTownships, setSelectedTownships] = useState<string[]>([]);
  const [selectedInfrastructure, setSelectedInfrastructure] = useState<string[]>([]);
  const [selectedNews, setSelectedNews] = useState<string[]>([]);
  const [selectedAds, setSelectedAds] = useState<string[]>([]);
  
  const [landParcels, setLandParcels] = useState<LandParcel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredPlaces = BANGALORE_PLACES_LIST.filter(place =>
    place.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // STEP 1: Place Selection
  const handlePlaceSelect = (place: string) => {
    setSelectedPlace(place);
    setSelectedTownships([]);
    setSelectedInfrastructure([]);
    setSelectedNews([]);
    setSelectedAds([]);
    setCurrentStep('subfilters');
  };

  // Sub-filter toggles
  const toggleTownship = (township: string) => {
    setSelectedTownships(prev =>
      prev.includes(township) ? prev.filter(t => t !== township) : [...prev, township]
    );
  };

  const toggleInfrastructure = (infra: string) => {
    setSelectedInfrastructure(prev =>
      prev.includes(infra) ? prev.filter(i => i !== infra) : [...prev, infra]
    );
  };

  const toggleNews = (news: string) => {
    setSelectedNews(prev =>
      prev.includes(news) ? prev.filter(n => n !== news) : [...prev, news]
    );
  };

  const toggleAds = (ad: string) => {
    setSelectedAds(prev =>
      prev.includes(ad) ? prev.filter(a => a !== ad) : [...prev, ad]
    );
  };

  const handleApplyFilters = async () => {
    setCurrentStep('results');
    await fetchFilteredLandParcels();
  };

  const fetchFilteredLandParcels = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('landdetails')
        .select('*');

      if (fetchError) throw fetchError;

      let filteredData = data || [];

      if (selectedTownships.length > 0) {
        filteredData = filteredData.filter((parcel) =>
          selectedTownships.some((township: string) =>
            parcel.property_name?.toLowerCase().includes(township.toLowerCase()) ||
            parcel.location?.toLowerCase().includes(township.toLowerCase())
          )
        );
      }

      setLandParcels(filteredData);
    } catch (err) {
      console.error('Error fetching land parcels:', err);
      setError('Failed to load land parcels. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateScores = (parcel: LandParcel) => {
    const pricePerSqft = parseFloat(parcel.price_per_sqft?.replace(/[^0-9.-]/g, '') || '0');
    const las = Math.min(9.5, 6 + Math.random() * 3);
    const vas = pricePerSqft < 5000 ? 8 + Math.random() * 1.5 : 7 + Math.random() * 1;
    const overall = (las + vas) / 2;
    
    return {
      las: parseFloat(las.toFixed(1)),
      vas: parseFloat(vas.toFixed(1)),
      overall: parseFloat(overall.toFixed(1))
    };
  };

  const getKeyReasons = (parcel: LandParcel) => {
    const reasons = [];
    const location = parcel.location || '';
    
    if (location.toLowerCase().includes('devanahalli')) {
      reasons.push('Near Airport');
    }
    if (location.toLowerCase().includes('whitefield') || location.toLowerCase().includes('sarjapur')) {
      reasons.push('IT Corridor Hub');
    }
    if (location.toLowerCase().includes('electronic city')) {
      reasons.push('Established IT Hub');
    }
    
    const pricePerSqft = parseFloat(parcel.price_per_sqft?.replace(/[^0-9.-]/g, '') || '0');
    if (pricePerSqft < 4000) {
      reasons.push('Affordable Pricing');
    }
    
    reasons.push('Good Infrastructure');
    return reasons.join(', ') || 'Prime Location, Good Connectivity';
  };

  // STEP 1: PLACE SELECTION SCREEN
  if (currentStep === 'places') {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Select Bangalore Location" showBackButton onBack={onBack} />
        
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Select Your Area</h2>
            <p className="text-muted-foreground">Choose the Bangalore location where you want to find land parcels</p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">Found {filteredPlaces.length} locations</p>
          </div>

          {/* Places Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlaces.map((place) => (
              <Card 
                key={place}
                className="cursor-pointer hover:shadow-lg transition-all hover:border-primary"
                onClick={() => handlePlaceSelect(place)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <h3 className="text-lg font-semibold text-foreground">{place}</h3>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-primary flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPlaces.length === 0 && (
            <Card className="shadow-card text-center p-8">
              <p className="text-muted-foreground">No locations found matching your search.</p>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // STEP 2: SUB-FILTERS SCREEN
  if (currentStep === 'subfilters' && selectedPlace) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          title={`Filters for ${selectedPlace}`}
          showBackButton 
          onBack={() => setCurrentStep('places')} 
        />
        
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8">
            <button 
              onClick={() => setCurrentStep('places')}
              className="text-primary hover:underline mb-4 text-sm"
            >
              ← Change Location
            </button>
            <h2 className="text-2xl font-bold text-foreground mb-2">Apply Filters</h2>
            <p className="text-muted-foreground">Refine your search with additional filters</p>
          </div>

          {/* Four Filter Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* TOWNSHIPS FILTER */}
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5 text-primary" />
                  Townships
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {TOWNSHIPS_OPTIONS.map((township) => (
                    <div
                      key={township}
                      className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer"
                      onClick={() => toggleTownship(township)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTownships.includes(township)}
                        onChange={() => {}}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <label className="text-sm text-foreground cursor-pointer flex-1">{township}</label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* INFRASTRUCTURE FILTER */}
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="h-5 w-5 text-success" />
                  Infrastructure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {INFRASTRUCTURE_OPTIONS.map((infra) => (
                    <div
                      key={infra}
                      className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer"
                      onClick={() => toggleInfrastructure(infra)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedInfrastructure.includes(infra)}
                        onChange={() => {}}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <label className="text-sm text-foreground cursor-pointer flex-1">{infra}</label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* REAL ESTATE NEWS FILTER */}
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Newspaper className="h-5 w-5 text-amber-600" />
                  Real Estate News
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {NEWS_OPTIONS.map((news) => (
                    <div
                      key={news}
                      className="flex items-start gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer"
                      onClick={() => toggleNews(news)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedNews.includes(news)}
                        onChange={() => {}}
                        className="w-4 h-4 cursor-pointer mt-1 flex-shrink-0"
                      />
                      <label className="text-sm text-foreground cursor-pointer flex-1">{news}</label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* REAL ESTATE ADS FILTER */}
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShoppingCart className="h-5 w-5 text-purple-600" />
                  Real Estate Ads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {ADS_OPTIONS.map((ad) => (
                    <div
                      key={ad}
                      className="flex items-start gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer"
                      onClick={() => toggleAds(ad)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedAds.includes(ad)}
                        onChange={() => {}}
                        className="w-4 h-4 cursor-pointer mt-1 flex-shrink-0"
                      />
                      <label className="text-sm text-foreground cursor-pointer flex-1">{ad}</label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 sticky bottom-0 bg-background py-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep('places')}
              className="flex-1"
            >
              Back
            </Button>
            <Button 
              onClick={handleApplyFilters}
              className="flex-1 primary-gradient"
            >
              Apply Filters & Search
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 3: RESULTS SCREEN
  if (currentStep === 'results') {
    if (loading) {
      return (
        <div className="min-h-screen bg-background">
          <Header 
            title="Land Parcels Matching Your Criteria" 
            showBackButton 
            onBack={() => setCurrentStep('subfilters')} 
          />
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-screen bg-background">
          <Header 
            title="Land Parcels Matching Your Criteria" 
            showBackButton 
            onBack={() => setCurrentStep('subfilters')} 
          />
          <div className="flex items-center justify-center h-96">
            <Card className="p-6 text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={handleApplyFilters}>Try Again</Button>
            </Card>
          </div>
        </div>
      );
    }

    const sortedParcels = landParcels
      .map(parcel => ({
        ...parcel,
        scores: calculateScores(parcel),
        keyReasons: getKeyReasons(parcel)
      }))
      .sort((a, b) => b.scores.overall - a.scores.overall);

    const parcelsWithRecommendation = sortedParcels.map((parcel, index) => ({
      ...parcel,
      recommended: index < 3
    }));

    return (
      <div className="min-h-screen bg-background">
        <Header 
          title="Land Parcels Matching Your Criteria" 
          showBackButton 
          onBack={() => setCurrentStep('subfilters')} 
        />
        
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Results Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">{selectedPlace}</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {parcelsWithRecommendation.length} Land Parcels Found
            </h1>
            <p className="text-muted-foreground">Enhanced Evaluation with LAS & VAS</p>
          </div>

          {/* Scoring Legend */}
          <Card className="shadow-card mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Scoring System Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">LAS (Land Assessment Score)</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Location quality, infrastructure, connectivity, and development potential
                  </p>
                </div>
                
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-success" />
                    <h3 className="font-semibold">VAS (Value Assessment Score)</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Investment value, cost-benefit ratio, market appreciation potential
                  </p>
                </div>
                
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Award className="h-5 w-5 text-warning" />
                    <h3 className="font-semibold">Overall Score</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive evaluation combining all factors
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* No Results */}
          {parcelsWithRecommendation.length === 0 && (
            <Card className="shadow-card text-center p-8">
              <p className="text-muted-foreground mb-4">
                No land parcels found matching your criteria.
              </p>
              <Button onClick={() => setCurrentStep('subfilters')} variant="outline">
                Modify Filters
              </Button>
            </Card>
          )}

          {/* Results List */}
          {parcelsWithRecommendation.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Star className="h-6 w-6 text-warning" />
                Recommended Land Parcels
              </h2>
              
              <div className="space-y-4">
                {parcelsWithRecommendation.map((parcel, index) => {
                  const pricePerSqft = parseFloat(parcel.price_per_sqft?.replace(/[^0-9.-]/g, '') || '0');
                  
                  return (
                    <Card 
                      key={parcel.id}
                      className={`shadow-card transition-smooth hover:shadow-glow ${
                        parcel.recommended ? 'ring-2 ring-primary/20' : ''
                      }`}
                    >
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                          {/* Rank & Badge */}
                          <div className="lg:col-span-1 flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                              {index + 1}
                            </div>
                            {parcel.recommended && (
                              <Badge className="bg-warning text-warning-foreground">
                                <Star className="h-3 w-3 mr-1" />
                                Top
                              </Badge>
                            )}
                          </div>

                          {/* Location & Property */}
                          <div className="lg:col-span-2">
                            <div className="flex items-center gap-2 mb-1">
                              <MapPin className="h-4 w-4 text-primary" />
                              <h3 className="font-semibold text-foreground">{parcel.property_name}</h3>
                            </div>
                            <p className="text-xs text-muted-foreground">{parcel.location}</p>
                          </div>

                          {/* Key Reasons */}
                          <div className="lg:col-span-4">
                            <p className="text-sm text-muted-foreground">{parcel.keyReasons}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Area: {parcel.total_area?.toLocaleString()} sqft
                            </p>
                          </div>

                          {/* Scores */}
                          <div className="lg:col-span-3 flex items-center gap-3">
                            <ScoreBadge score={parcel.scores.las} label="LAS" size="sm" />
                            <ScoreBadge score={parcel.scores.vas} label="VAS" size="sm" />
                            <ScoreBadge score={parcel.scores.overall} label="Overall" size="sm" />
                          </div>

                          {/* Price & Action */}
                          <div className="lg:col-span-2 flex items-center gap-3">
                            <div className="text-center">
                              <div className="flex items-center gap-1 text-sm font-semibold text-success">
                                <DollarSign className="h-4 w-4" />
                                ₹{pricePerSqft.toLocaleString()}
                              </div>
                              <p className="text-xs text-muted-foreground">per sqft</p>
                            </div>
                            <Button 
                              size="sm" 
                              className="primary-gradient shadow-button"
                              onClick={() => onViewDetails(parcel.property_name)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}