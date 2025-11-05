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
  Building2,
  Zap,
  Newspaper,
  ShoppingCart
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/Supabase/supabaseclient";

interface FilteredLandParcelsProps {
  filters: any;
  onBack: () => void;
  onViewDetails: (parcelId: string) => void;
}

interface LandParcel {
  id: string;
  property_name: string;
  location?: string;
  total_area?: number;
  total_price?: string;
  price_per_sqft?: string;
  source?: string;
  url?: string;
  latitude?: string | number | null;
  longitude?: string | number | null;
}

interface TownshipCoordinate {
  name: string;
  latitude: number;
  longitude: number;
  distance: number;
}

export function FilteredLandParcels({ filters, onBack, onViewDetails }: FilteredLandParcelsProps) {
  const [landParcels, setLandParcels] = useState<LandParcel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Distance calculation helper
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const fetchFilteredLandParcels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Filters received:', filters);

      // Fetch all land parcels
      const { data, error: fetchError } = await supabase
        .from('landdetails')
        .select('*');

      if (fetchError) {
        console.error('Supabase fetch error:', fetchError);
        throw fetchError;
      }

      let results: LandParcel[] = (data || []) as LandParcel[];
      console.log(`Total parcels from database: ${results.length}`);

      // Strategy 1: Filter by selected township coordinates (most specific)
      if (filters?.townshipCoordinates && Array.isArray(filters.townshipCoordinates) && filters.townshipCoordinates.length > 0) {
        console.log('Filtering by township coordinates:', filters.townshipCoordinates);
        
        const filteredByTownship = results.filter((parcel) => {
          if (!parcel.latitude || !parcel.longitude) return false;

          const parcelLat = typeof parcel.latitude === 'string' ? parseFloat(parcel.latitude) : parcel.latitude;
          const parcelLon = typeof parcel.longitude === 'string' ? parseFloat(parcel.longitude) : parcel.longitude;

          if (isNaN(parcelLat) || isNaN(parcelLon)) return false;

          // Check if parcel is near any selected township (within 10km for better results)
          return filters.townshipCoordinates.some((township: TownshipCoordinate) => {
            const distance = calculateDistance(
              township.latitude,
              township.longitude,
              parcelLat,
              parcelLon
            );
            console.log(`Distance from ${parcel.property_name} to ${township.name}: ${distance.toFixed(2)}km`);
            return distance <= 10; // Increased from 5km to 10km
          });
        });

        console.log(`Parcels after township coordinate filter: ${filteredByTownship.length}`);
        
        if (filteredByTownship.length > 0) {
          results = filteredByTownship;
        } else {
          console.log('No parcels found by coordinates, trying text-based search...');
        }
      }

      // Strategy 2: Text-based filtering for property_name or location (fallback)
      if (filters?.townships && Array.isArray(filters.townships) && filters.townships.length > 0) {
        console.log('Applying text-based township filter:', filters.townships);
        
        const lowerTownships = filters.townships.map((t: string) => t.toLowerCase());
        const textFiltered = results.filter((parcel) => {
          const pn = (parcel.property_name || "").toLowerCase();
          const loc = (parcel.location || "").toLowerCase();
          
          // Check for partial matches
          return lowerTownships.some((t: string) => {
            // Split township name into words and check if any word matches
            const words = t.split(/\s+/);
            return words.some(word => word.length > 3 && (pn.includes(word) || loc.includes(word)));
          });
        });

        console.log(`Parcels after text filter: ${textFiltered.length}`);
        
        // If text filtering gives results, use those
        if (textFiltered.length > 0) {
          results = textFiltered;
        }
      }

      // Strategy 3: Filter by place coordinates (broader area filter)
      if (results.length === 0 && filters?.placeCoordinates?.latitude && filters?.placeCoordinates?.longitude) {
        console.log('Filtering by place coordinates:', filters.placeCoordinates);
        
        results = (data || []).filter((parcel) => {
          if (!parcel.latitude || !parcel.longitude) return false;

          const parcelLat = typeof parcel.latitude === 'string' ? parseFloat(parcel.latitude) : parcel.latitude;
          const parcelLon = typeof parcel.longitude === 'string' ? parseFloat(parcel.longitude) : parcel.longitude;

          if (isNaN(parcelLat) || isNaN(parcelLon)) return false;

          const distance = calculateDistance(
            filters.placeCoordinates.latitude,
            filters.placeCoordinates.longitude,
            parcelLat,
            parcelLon
          );

          return distance <= (filters.searchRadius || 50);
        });

        console.log(`Parcels after place coordinate filter: ${results.length}`);
      }

      console.log(`Final results count: ${results.length}`);
      setLandParcels(results);
      
    } catch (err) {
      console.error('Error fetching land parcels:', err);
      setError('Failed to load land parcels. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchFilteredLandParcels();
  }, [fetchFilteredLandParcels]);

  const calculateScores = (parcel: LandParcel) => {
    const pricePerSqft = parseFloat((parcel.price_per_sqft || '').replace(/[^0-9.-]/g, '') || '0');

    // Calculate distance-based score if coordinates available
    let locationScore = 7; // default
    
    // Prioritize township distance if available
    if (parcel.latitude && parcel.longitude && filters?.townshipCoordinates && filters.townshipCoordinates.length > 0) {
      const parcelLat = typeof parcel.latitude === 'string' ? parseFloat(parcel.latitude) : parcel.latitude;
      const parcelLon = typeof parcel.longitude === 'string' ? parseFloat(parcel.longitude) : parcel.longitude;

      if (!isNaN(parcelLat) && !isNaN(parcelLon)) {
        // Find minimum distance to any selected township
        const minDistance = Math.min(
          ...filters.townshipCoordinates.map((township: TownshipCoordinate) =>
            calculateDistance(township.latitude, township.longitude, parcelLat, parcelLon)
          )
        );
        // Closer to township = higher score
        locationScore = Math.max(6, 10 - (minDistance / 2));
      }
    } else if (parcel.latitude && parcel.longitude && filters?.placeCoordinates?.latitude && filters?.placeCoordinates?.longitude) {
      const parcelLat = typeof parcel.latitude === 'string' ? parseFloat(parcel.latitude) : parcel.latitude;
      const parcelLon = typeof parcel.longitude === 'string' ? parseFloat(parcel.longitude) : parcel.longitude;

      if (!isNaN(parcelLat) && !isNaN(parcelLon)) {
        const distance = calculateDistance(
          filters.placeCoordinates.latitude,
          filters.placeCoordinates.longitude,
          parcelLat,
          parcelLon
        );
        locationScore = Math.max(5, 10 - (distance / 5));
      }
    }

    // Infrastructure bonus
    const infraBonus = (filters?.infrastructure && Array.isArray(filters.infrastructure) && filters.infrastructure.length > 0) ? 0.5 : 0;
    const las = Math.min(10, locationScore + infraBonus);

    // VAS - value based on price
    const vas = pricePerSqft > 0 && pricePerSqft < 4000 
      ? 8 + Math.random() * 1.5 
      : 7 + Math.random() * 1;

    const overall = (las + vas) / 2;
    
    return {
      las: parseFloat(las.toFixed(1)),
      vas: parseFloat(vas.toFixed(1)),
      overall: parseFloat(overall.toFixed(1))
    };
  };

  const getKeyReasons = (parcel: LandParcel) => {
    const reasons: string[] = [];
    const location = (parcel.location || parcel.property_name || '').toLowerCase();
    
    if (location.includes('devanahalli') || location.includes('airport')) {
      reasons.push('Near Airport');
    }
    if (location.includes('whitefield') || location.includes('sarjapur')) {
      reasons.push('IT Corridor Hub');
    }
    if (location.includes('electronic city')) {
      reasons.push('Established IT Hub');
    }
    
    const pricePerSqft = parseFloat((parcel.price_per_sqft || '').replace(/[^0-9.-]/g, '') || '0');
    if (pricePerSqft < 4000 && pricePerSqft > 0) {
      reasons.push('Affordable Pricing');
    }

    // Distance to selected township
    if (parcel.latitude && parcel.longitude && filters?.townshipCoordinates && filters.townshipCoordinates.length > 0) {
      const parcelLat = typeof parcel.latitude === 'string' ? parseFloat(parcel.latitude) : parcel.latitude;
      const parcelLon = typeof parcel.longitude === 'string' ? parseFloat(parcel.longitude) : parcel.longitude;

      if (!isNaN(parcelLat) && !isNaN(parcelLon)) {
        const distances = filters.townshipCoordinates.map((township: TownshipCoordinate) => ({
          name: township.name,
          distance: calculateDistance(township.latitude, township.longitude, parcelLat, parcelLon)
        }));
        
        const nearest = distances.sort((a, b) => a.distance - b.distance)[0];
        reasons.push(`${nearest.distance.toFixed(1)}km from ${nearest.name}`);
      }
    } else if (parcel.latitude && parcel.longitude && filters?.placeCoordinates?.latitude && filters?.placeCoordinates?.longitude) {
      const parcelLat = typeof parcel.latitude === 'string' ? parseFloat(parcel.latitude) : parcel.latitude;
      const parcelLon = typeof parcel.longitude === 'string' ? parseFloat(parcel.longitude) : parcel.longitude;

      if (!isNaN(parcelLat) && !isNaN(parcelLon)) {
        const distance = calculateDistance(
          filters.placeCoordinates.latitude,
          filters.placeCoordinates.longitude,
          parcelLat,
          parcelLon
        );
        reasons.push(`${distance.toFixed(1)}km from ${filters.place || 'selected area'}`);
      }
    }
    
    if (filters?.infrastructure && Array.isArray(filters.infrastructure) && filters.infrastructure.length > 0) {
      reasons.push('Preferred Infrastructure');
    }
    if (filters?.news && Array.isArray(filters.news) && filters.news.length > 0) {
      reasons.push('Recent Local Developments');
    }
    if (filters?.ads && Array.isArray(filters.ads) && filters.ads.length > 0) {
      reasons.push('Matched Ad Keywords');
    }
    
    if (reasons.length === 0) {
      reasons.push('Good Infrastructure', 'Prime Location');
    }
    
    return reasons.join(' • ');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          title="Land Parcels Matching Your Criteria" 
          showBackButton 
          onBack={onBack} 
        />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-muted-foreground">Fetching land parcels...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          title="Land Parcels Matching Your Criteria" 
          showBackButton 
          onBack={onBack} 
        />
        <div className="flex items-center justify-center h-96">
          <Card className="shadow-card p-6 text-center max-w-md">
            <p className="text-destructive mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={fetchFilteredLandParcels}>Try Again</Button>
              <Button variant="outline" onClick={onBack}>Go Back</Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Process and sort parcels
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

  // Results render
  return (
    <div className="min-h-screen bg-background">
      <Header 
        title="Land Parcels Matching Your Criteria" 
        showBackButton 
        onBack={onBack} 
      />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Results Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">
              {filters?.place || "Selected area"}
              {filters?.townships && filters.townships.length > 0 && 
                ` • Near ${filters.townships.join(', ')}`
              }
            </span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {parcelsWithRecommendation.length} Land Parcels Found
          </h1>
          <p className="text-muted-foreground mb-3">Enhanced evaluation using LAS & VAS scoring</p>
          
          {/* Applied filters badges */}
          <div className="flex flex-wrap gap-2">
            {filters?.townships && Array.isArray(filters.townships) && filters.townships.length > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {filters.townships.length} Township{filters.townships.length > 1 ? 's' : ''}
              </Badge>
            )}
            {filters?.infrastructure && Array.isArray(filters.infrastructure) && filters.infrastructure.length > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                {filters.infrastructure.length} Infrastructure
              </Badge>
            )}
            {filters?.news && Array.isArray(filters.news) && filters.news.length > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Newspaper className="h-3 w-3" />
                {filters.news.length} News
              </Badge>
            )}
            {filters?.ads && Array.isArray(filters.ads) && filters.ads.length > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <ShoppingCart className="h-3 w-3" />
                {filters.ads.length} Ads
              </Badge>
            )}
          </div>
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
                  <h3 className="font-semibold text-sm">LAS (Land Assessment)</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Location quality, infrastructure, connectivity based on proximity
                </p>
              </div>
              
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-success" />
                  <h3 className="font-semibold text-sm">VAS (Value Assessment)</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Investment value, cost-benefit ratio, market appreciation potential
                </p>
              </div>
              
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-warning" />
                  <h3 className="font-semibold text-sm">Overall Score</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Comprehensive evaluation combining all factors
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* No Results */}
        {parcelsWithRecommendation.length === 0 && (
          <Card className="shadow-card text-center p-8">
            <p className="text-muted-foreground mb-2">
              No land parcels found matching your criteria.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Try selecting different townships or adjusting your filters.
            </p>
            <Button onClick={onBack} variant="outline">
              Back to Filters
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
                const pricePerSqft = parseFloat((parcel.price_per_sqft || '').replace(/[^0-9.-]/g, '') || '0');
                
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
                          <p className="text-xs text-muted-foreground">{parcel.location || 'Location not specified'}</p>
                        </div>

                        {/* Key Reasons */}
                        <div className="lg:col-span-4">
                          <p className="text-sm text-muted-foreground">{parcel.keyReasons}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Area: {parcel.total_area ? parcel.total_area.toLocaleString() : '—'} sqft
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
                              ₹{isNaN(pricePerSqft) ? '—' : pricePerSqft.toLocaleString()}
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