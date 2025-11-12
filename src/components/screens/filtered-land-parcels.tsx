import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Eye, 
  Star,
  Loader2,
  DollarSign,
  Maximize2,
  Navigation
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

      // ========================================
      // FILTER BY COST (price per sq ft)
      // ========================================
      if (filters?.maxCost && typeof filters.maxCost === 'number') {
        console.log(`Filtering by cost: ≤ ₹${filters.maxCost} per sq ft`);
        
        results = results.filter((parcel) => {
          const pricePerSqft = parseFloat((parcel.price_per_sqft || '').replace(/[^0-9.-]/g, '') || '0');
          return pricePerSqft > 0 && pricePerSqft <= filters.maxCost;
        });
        
        console.log(`Parcels after cost filter: ${results.length}`);
      }

      // ========================================
      // FILTER BY SIZE (total area)
      // ========================================
      if (filters?.minSize !== undefined || filters?.maxSize !== undefined) {
        const minSize = filters.minSize || 0;
        const maxSize = filters.maxSize || Infinity;
        
        console.log(`Filtering by size: ${minSize} - ${maxSize} sq ft`);
        
        results = results.filter((parcel) => {
          const area = parcel.total_area || 0;
          return area >= minSize && area <= maxSize;
        });
        
        console.log(`Parcels after size filter: ${results.length}`);
      }

      // ========================================
      // FILTER BY DISTANCE
      // ========================================
      if (filters?.maxDistance && typeof filters.maxDistance === 'number') {
        console.log(`Filtering by distance: ≤ ${filters.maxDistance} km`);
        
        // Need reference coordinates for distance calculation
        let referenceCoords = null;
        
        // Try to get coordinates from township coordinates
        if (filters.townshipCoordinates && filters.townshipCoordinates.length > 0) {
          referenceCoords = {
            latitude: filters.townshipCoordinates[0].latitude,
            longitude: filters.townshipCoordinates[0].longitude
          };
        } 
        // Or from place coordinates
        else if (filters.placeCoordinates?.latitude && filters.placeCoordinates?.longitude) {
          referenceCoords = filters.placeCoordinates;
        }
        // Or from user's current location (if available)
        else if (filters.userLocation?.latitude && filters.userLocation?.longitude) {
          referenceCoords = filters.userLocation;
        }

        if (referenceCoords) {
          results = results.filter((parcel) => {
            if (!parcel.latitude || !parcel.longitude) return false;

            const parcelLat = typeof parcel.latitude === 'string' ? parseFloat(parcel.latitude) : parcel.latitude;
            const parcelLon = typeof parcel.longitude === 'string' ? parseFloat(parcel.longitude) : parcel.longitude;

            if (isNaN(parcelLat) || isNaN(parcelLon)) return false;

            const distance = calculateDistance(
              referenceCoords.latitude,
              referenceCoords.longitude,
              parcelLat,
              parcelLon
            );

            return distance <= filters.maxDistance;
          });
          
          console.log(`Parcels after distance filter: ${results.length}`);
        } else {
          console.warn('No reference coordinates available for distance filtering');
        }
      }

      // ========================================
      // FILTER BY TOWNSHIP COORDINATES
      // ========================================
      if (filters?.townshipCoordinates && Array.isArray(filters.townshipCoordinates) && filters.townshipCoordinates.length > 0) {
        console.log('Filtering by township coordinates:', filters.townshipCoordinates);
        
        const filteredByTownship = results.filter((parcel) => {
          if (!parcel.latitude || !parcel.longitude) return false;

          const parcelLat = typeof parcel.latitude === 'string' ? parseFloat(parcel.latitude) : parcel.latitude;
          const parcelLon = typeof parcel.longitude === 'string' ? parseFloat(parcel.longitude) : parcel.longitude;

          if (isNaN(parcelLat) || isNaN(parcelLon)) return false;

          // Check if parcel is near any selected township (within 10km)
          return filters.townshipCoordinates.some((township: TownshipCoordinate) => {
            const distance = calculateDistance(
              township.latitude,
              township.longitude,
              parcelLat,
              parcelLon
            );
            return distance <= 10;
          });
        });

        console.log(`Parcels after township coordinate filter: ${filteredByTownship.length}`);
        
        if (filteredByTownship.length > 0) {
          results = filteredByTownship;
        } else {
          console.log('No parcels found by coordinates, trying text-based search...');
        }
      }

      // ========================================
      // TEXT-BASED TOWNSHIP FILTERING
      // ========================================
      if (filters?.townships && Array.isArray(filters.townships) && filters.townships.length > 0) {
        console.log('Applying text-based township filter:', filters.townships);
        
        const lowerTownships = filters.townships.map((t: string) => t.toLowerCase());
        const textFiltered = results.filter((parcel) => {
          const pn = (parcel.property_name || "").toLowerCase();
          const loc = (parcel.location || "").toLowerCase();
          
          // Check for partial matches
          return lowerTownships.some((t: string) => {
            const words = t.split(/\s+/);
            return words.some(word => word.length > 3 && (pn.includes(word) || loc.includes(word)));
          });
        });

        console.log(`Parcels after text filter: ${textFiltered.length}`);
        
        if (textFiltered.length > 0) {
          results = textFiltered;
        }
      }

      // ========================================
      // FILTER BY PLACE COORDINATES
      // ========================================
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
    let locationScore = 7;
    
    // Prioritize township distance if available
    if (parcel.latitude && parcel.longitude && filters?.townshipCoordinates && filters.townshipCoordinates.length > 0) {
      const parcelLat = typeof parcel.latitude === 'string' ? parseFloat(parcel.latitude) : parcel.latitude;
      const parcelLon = typeof parcel.longitude === 'string' ? parseFloat(parcel.longitude) : parcel.longitude;

      if (!isNaN(parcelLat) && !isNaN(parcelLon)) {
        const minDistance = Math.min(
          ...filters.townshipCoordinates.map((township: TownshipCoordinate) =>
            calculateDistance(township.latitude, township.longitude, parcelLat, parcelLon)
          )
        );
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

  // Get filter summary for display
  const getFilterSummary = () => {
    const summary = [];
    
    if (filters?.maxCost) {
      summary.push(`Cost ≤ ₹${filters.maxCost}/sq ft`);
    }
    if (filters?.minSize || filters?.maxSize) {
      const min = filters.minSize || 0;
      const max = filters.maxSize || '∞';
      summary.push(`Size: ${min} - ${max} sq ft`);
    }
    if (filters?.maxDistance) {
      summary.push(`Distance ≤ ${filters.maxDistance} km`);
    }
    if (filters?.townships && filters.townships.length > 0) {
      summary.push(filters.townships.join(', '));
    }
    
    return summary.length > 0 ? summary.join(' | ') : 'All areas';
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="container mx-auto px-6 py-4">
            <h1 className="text-3xl font-bold text-gray-900">Land Parcels</h1>
          </div>
        </div>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-gray-600">Fetching land parcels...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="container mx-auto px-6 py-4">
            <h1 className="text-3xl font-bold text-gray-900">Land Parcels</h1>
          </div>
        </div>
        <div className="flex items-center justify-center h-96">
          <div className="bg-white rounded-lg shadow p-6 text-center max-w-md">
            <p className="text-red-600 mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={fetchFilteredLandParcels}>Try Again</Button>
              <Button variant="outline" onClick={onBack}>Go Back</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Process and sort parcels
  const sortedParcels = landParcels
    .map(parcel => ({
      ...parcel,
      scores: calculateScores(parcel)
    }))
    .sort((a, b) => b.scores.overall - a.scores.overall);

  const parcelsWithRecommendation = sortedParcels.map((parcel, index) => ({
    ...parcel,
    recommended: index < 3
  }));

  // Results render
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <MapPin className="h-4 w-4" />
            <span>{getFilterSummary()}</span>
          </div>
          
          {/* Active Filters Display */}
          <div className="flex flex-wrap gap-2 mb-3">
            {filters?.maxCost && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                <DollarSign className="h-3 w-3" />
                ≤ ₹{filters.maxCost}/sq ft
              </span>
            )}
            {(filters?.minSize || filters?.maxSize) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                <Maximize2 className="h-3 w-3" />
                {filters.minSize || 0} - {filters.maxSize || '∞'} sq ft
              </span>
            )}
            {filters?.maxDistance && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-medium">
                <Navigation className="h-3 w-3" />
                ≤ {filters.maxDistance} km
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                Land Parcels
              </h1>
              <p className="text-gray-600">
                {parcelsWithRecommendation.length} results found
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={onBack} variant="outline" size="sm">
                Back to Filters
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-6 py-6">
        {/* No Results */}
        {parcelsWithRecommendation.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-2">
              No land parcels found matching your criteria.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Try adjusting your filters or selecting different criteria.
            </p>
            <Button onClick={onBack} variant="outline">
              Back to Filters
            </Button>
          </div>
        )}

        {/* Results Table */}
        {parcelsWithRecommendation.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    S.No.
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Property Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Area (sqft)
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Price/sqft
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Overall Score
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {parcelsWithRecommendation.map((parcel, index) => {
                  const pricePerSqft = parseFloat((parcel.price_per_sqft || '').replace(/[^0-9.-]/g, '') || '0');
                  
                  return (
                    <tr 
                      key={parcel.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          {index + 1}.
                          {parcel.recommended && (
                            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <a 
                          href="#" 
                          className="text-blue-600 hover:underline font-medium"
                          onClick={(e) => {
                            e.preventDefault();
                            onViewDetails(parcel.property_name);
                          }}
                        >
                          {parcel.property_name}
                        </a>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {parcel.location || '—'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {parcel.total_area ? parcel.total_area.toLocaleString() : '—'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {isNaN(pricePerSqft) || pricePerSqft === 0 ? '—' : `₹${pricePerSqft.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                        {parcel.scores.overall.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center text-sm">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => onViewDetails(parcel.property_name)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
  
}