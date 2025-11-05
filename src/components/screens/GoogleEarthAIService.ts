// GoogleEarthAIService.ts - Completely Free, No API Keys Required
// Intelligent rule-based analysis using location data

export interface LandAnalysisResult {
  pros: string[];
  cons: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
  recommendations: string[];
  confidence: number;
  analysisDate: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  locationName: string;
  area?: number;
  pricePerSqft?: number;
}

/**
 * Free Intelligent Land Analysis Service
 * No API keys or external services required
 */
export class FreeRiskAnalysisService {
  // Bangalore city center coordinates
  private readonly BANGALORE_CENTER = { lat: 12.9716, lng: 77.5946 };
  
  // Airport coordinates
  private readonly AIRPORT = { lat: 13.1986, lng: 77.7101 };
  
  // Known IT hubs
  private readonly IT_HUBS = [
    { name: 'Whitefield', lat: 12.9698, lng: 77.7499 },
    { name: 'Electronic City', lat: 12.8456, lng: 77.6603 },
    { name: 'Outer Ring Road', lat: 12.9352, lng: 77.6245 },
    { name: 'Sarjapur', lat: 12.8988, lng: 77.7388 }
  ];

  /**
   * Main analysis function - completely free
   */
  async analyzeLandParcel(locationData: LocationData): Promise<LandAnalysisResult> {
    const { latitude, longitude, locationName, area, pricePerSqft } = locationData;
    
    // Calculate key metrics
    const distanceFromCity = this.calculateDistance(
      latitude, 
      longitude, 
      this.BANGALORE_CENTER.lat, 
      this.BANGALORE_CENTER.lng
    );
    
    const distanceFromAirport = this.calculateDistance(
      latitude, 
      longitude, 
      this.AIRPORT.lat, 
      this.AIRPORT.lng
    );
    
    const nearestITHub = this.findNearestITHub(latitude, longitude);
    
    // Detect location type
    const locationType = this.detectLocationType(locationName, distanceFromCity, distanceFromAirport);
    
    // Generate comprehensive analysis
    const analysis = this.generateAnalysis(
      locationType,
      distanceFromCity,
      distanceFromAirport,
      nearestITHub,
      locationName,
      area,
      pricePerSqft
    );
    
    return {
      ...analysis,
      analysisDate: new Date().toISOString()
    };
  }

  /**
   * Calculate distance between two coordinates (in km)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Find nearest IT hub
   */
  private findNearestITHub(lat: number, lng: number): { name: string; distance: number } {
    let nearest = { name: '', distance: Infinity };
    
    for (const hub of this.IT_HUBS) {
      const distance = this.calculateDistance(lat, lng, hub.lat, hub.lng);
      if (distance < nearest.distance) {
        nearest = { name: hub.name, distance };
      }
    }
    
    return nearest;
  }

  /**
   * Detect location type based on name and distances
   */
  private detectLocationType(
    locationName: string, 
    distanceFromCity: number, 
    distanceFromAirport: number
  ): string {
    const name = locationName.toLowerCase();
    
    if (name.includes('devanahalli') || name.includes('airport') || distanceFromAirport < 15) {
      return 'AIRPORT_ZONE';
    }
    if (name.includes('whitefield') || name.includes('varthur') || name.includes('marathahalli')) {
      return 'WHITEFIELD_CORRIDOR';
    }
    if (name.includes('electronic city') || name.includes('hosur') || name.includes('bommanahalli')) {
      return 'ELECTRONIC_CITY';
    }
    if (name.includes('sarjapur') || name.includes('hsr') || name.includes('bellandur')) {
      return 'SARJAPUR_CORRIDOR';
    }
    if (name.includes('hennur') || name.includes('hebbal') || name.includes('nagawara')) {
      return 'NORTH_BANGALORE';
    }
    if (name.includes('kengeri') || name.includes('mysore road') || name.includes('rajarajeshwari')) {
      return 'WEST_BANGALORE';
    }
    if (distanceFromCity < 15) {
      return 'CENTRAL_BANGALORE';
    }
    if (distanceFromCity < 30) {
      return 'SUBURBAN_BANGALORE';
    }
    return 'PERIPHERAL_BANGALORE';
  }

  /**
   * Generate comprehensive analysis based on location type
   */
  private generateAnalysis(
    locationType: string,
    distanceFromCity: number,
    distanceFromAirport: number,
    nearestITHub: { name: string; distance: number },
    locationName: string,
    area?: number,
    pricePerSqft?: number
  ): Omit<LandAnalysisResult, 'analysisDate'> {
    
    switch (locationType) {
      case 'AIRPORT_ZONE':
        return this.airportZoneAnalysis(distanceFromAirport, distanceFromCity, pricePerSqft);
      
      case 'WHITEFIELD_CORRIDOR':
        return this.whitefieldAnalysis(nearestITHub.distance, distanceFromAirport, pricePerSqft);
      
      case 'ELECTRONIC_CITY':
        return this.electronicCityAnalysis(distanceFromCity, pricePerSqft);
      
      case 'SARJAPUR_CORRIDOR':
        return this.sarjapurAnalysis(nearestITHub.distance, pricePerSqft);
      
      case 'NORTH_BANGALORE':
        return this.northBangaloreAnalysis(distanceFromCity, distanceFromAirport, pricePerSqft);
      
      case 'WEST_BANGALORE':
        return this.westBangaloreAnalysis(distanceFromCity, pricePerSqft);
      
      case 'CENTRAL_BANGALORE':
        return this.centralBangaloreAnalysis(pricePerSqft);
      
      case 'SUBURBAN_BANGALORE':
        return this.suburbanAnalysis(distanceFromCity, nearestITHub, pricePerSqft);
      
      default:
        return this.peripheralAnalysis(distanceFromCity, nearestITHub, pricePerSqft);
    }
  }

  private airportZoneAnalysis(distanceFromAirport: number, distanceFromCity: number, pricePerSqft?: number): Omit<LandAnalysisResult, 'analysisDate'> {
    const isVeryClose = distanceFromAirport < 10;
    
    return {
      pros: [
        `Excellent proximity to Kempegowda International Airport (${distanceFromAirport.toFixed(1)} km)`,
        "Rapidly developing aerospace and logistics hub with strong growth potential",
        "Upcoming Namma Metro Phase 2 extension will enhance connectivity significantly",
        "STRR (Satellite Town Ring Road) and PRR improving regional accessibility",
        pricePerSqft && pricePerSqft < 5000 
          ? `Attractive pricing at ₹${pricePerSqft}/sqft - below market average for airport zone`
          : "Lower land prices compared to established IT corridors with high appreciation potential"
      ],
      cons: [
        `Significant distance from city center (${distanceFromCity.toFixed(1)} km) - impacts daily commute`,
        "Limited social infrastructure - schools, hospitals, and shopping centers are developing",
        "Heavy dependence on airport and aerospace sector for economic growth",
        isVeryClose 
          ? "Potential aircraft noise pollution - check if property falls in noise impact zone"
          : "Water scarcity concerns in certain pockets - verify BWSSB connection",
        "Current traffic congestion on airport road during peak morning/evening hours"
      ],
      riskLevel: 'Low',
      recommendations: [
        "Verify RERA registration and clear title - check for any land acquisition disputes",
        "Confirm BWSSB water connection or reliable borwell/tanker water availability",
        isVeryClose 
          ? "Check Airports Authority noise zone maps - avoid properties in high-impact zones"
          : "Investigate upcoming infrastructure projects - metro stations, business parks",
        "Plan for 3-5 year investment horizon for optimal capital appreciation",
        "Visit during peak hours to assess actual traffic conditions on approach roads"
      ],
      confidence: 88
    };
  }

  private whitefieldAnalysis(distanceFromHub: number, distanceFromAirport: number, pricePerSqft?: number): Omit<LandAnalysisResult, 'analysisDate'> {
    return {
      pros: [
        "Established IT corridor with presence of major tech companies (Infosys, Wipro, TCS)",
        "Excellent social infrastructure including premium schools, hospitals, and malls",
        "Strong rental demand from IT professionals ensures 3-4% rental yields",
        "Well-connected via Outer Ring Road and upcoming Whitefield Metro connectivity",
        "Proven track record of 8-12% annual appreciation over past decade"
      ],
      cons: [
        pricePerSqft && pricePerSqft > 8000
          ? `High land acquisition cost at ₹${pricePerSqft}/sqft - premium pricing for the area`
          : "Premium pricing compared to emerging corridors - higher entry barrier",
        "Severe traffic congestion during peak hours especially on ORR and Whitefield Road",
        "Limited availability of large contiguous land parcels for development",
        `Distance from airport (${distanceFromAirport.toFixed(1)} km) may be consideration for frequent travelers`,
        "Market saturation in certain micro-markets - slower appreciation in developed pockets"
      ],
      riskLevel: 'Low',
      recommendations: [
        "Prioritize locations within 1-2 km of upcoming metro stations for maximum appreciation",
        "Verify zoning regulations carefully - residential/commercial/mixed-use permissions",
        "Conduct thorough soil testing and check historical monsoon flooding data",
        "Compare pricing with recent 3-6 month transactions in the specific micro-market",
        "Evaluate mixed-use development potential for commercial ground floor + residential"
      ],
      confidence: 92
    };
  }

  private electronicCityAnalysis(distanceFromCity: number, pricePerSqft?: number): Omit<LandAnalysisResult, 'analysisDate'> {
    return {
      pros: [
        "Established IT/manufacturing hub with strong employment base (Infosys, Wipro, Biocon)",
        "Excellent connectivity via Elevated Expressway and upcoming Metro Yellow Line",
        "Mature infrastructure with schools, hospitals, shopping centers, and entertainment",
        "Proximity to Tamil Nadu border enables inter-state business opportunities",
        pricePerSqft && pricePerSqft < 6000
          ? `Competitive pricing at ₹${pricePerSqft}/sqft compared to Whitefield/Sarjapur`
          : "More affordable than Whitefield/Sarjapur with steady 7-10% appreciation"
      ],
      cons: [
        "Industrial character limits premium residential appeal for some buyer segments",
        "Air quality concerns due to industrial activities and traffic on Hosur Road",
        `Distance from north Bangalore and airport (40+ km) affects connectivity`,
        "Limited ultra-premium residential projects compared to other corridors",
        "Strong dependence on IT sector employment trends and economic cycles"
      ],
      riskLevel: 'Low',
      recommendations: [
        "Focus on areas within 1 km of metro stations for residential developments",
        "Verify air quality index and industrial emissions in immediate vicinity",
        "Check for any industrial waste disposal or pollution concerns nearby",
        "Consider mixed residential-commercial models leveraging employment base",
        "Ensure property has good connectivity to Elevated Expressway toll plaza"
      ],
      confidence: 85
    };
  }

  private sarjapurAnalysis(distanceFromHub: number, pricePerSqft?: number): Omit<LandAnalysisResult, 'analysisDate'> {
    return {
      pros: [
        "Rapidly developing corridor with major IT parks (Embassy, RMZ, Prestige)",
        "Upcoming Peripheral Ring Road (PRR) will dramatically improve connectivity",
        "Strong infrastructure development with wide roads and planned utilities",
        "Mix of IT employment and residential demand creates balanced market",
        pricePerSqft && pricePerSqft < 7000
          ? `Good value at ₹${pricePerSqft}/sqft with high growth trajectory`
          : "More affordable than Whitefield with similar growth potential"
      ],
      cons: [
        "Current traffic congestion on Sarjapur Road during peak hours",
        "Dependency on PRR completion for improved connectivity (timeline risks)",
        "Water scarcity issues in some areas - not all areas have BWSSB connection",
        "Social infrastructure still developing - limited premium schools/hospitals",
        "Distance from both city center and airport affects accessibility"
      ],
      riskLevel: 'Medium',
      recommendations: [
        "Verify proximity to upcoming PRR alignment for maximum future value",
        "Confirm water source - BWSSB connection strongly preferred over borewells",
        "Check quality of road access - avoid areas with narrow internal roads",
        "Plan for 4-6 year holding period to benefit from infrastructure development",
        "Research upcoming IT park announcements in the specific micro-location"
      ],
      confidence: 82
    };
  }

  private northBangaloreAnalysis(distanceFromCity: number, distanceFromAirport: number, pricePerSqft?: number): Omit<LandAnalysisResult, 'analysisDate'> {
    return {
      pros: [
        `Excellent connectivity to airport (${distanceFromAirport.toFixed(1)} km) via Bellary Road`,
        "Developing IT corridor with Manyata Tech Park and upcoming projects",
        "Metro connectivity (Green Line) already operational - enhances accessibility",
        "Relatively affordable compared to established corridors",
        "Growing residential demand from IT professionals working in north zone"
      ],
      cons: [
        "Limited premium social infrastructure compared to Whitefield/Sarjapur",
        "Industrial pockets in Peenya area may affect residential appeal",
        "Flood-prone areas near Hebbal Lake - requires careful location selection",
        "Traffic congestion on Outer Ring Road and Bellary Road",
        "Uneven development - some pockets well-developed, others still emerging"
      ],
      riskLevel: 'Medium',
      recommendations: [
        "Prioritize locations near operational metro stations",
        "Check flood history and drainage systems - avoid low-lying areas",
        "Verify distance from industrial areas and warehouses",
        "Research upcoming IT park projects in the specific area",
        "Ensure good connectivity to both ORR and airport road"
      ],
      confidence: 78
    };
  }

  private westBangaloreAnalysis(distanceFromCity: number, pricePerSqft?: number): Omit<LandAnalysisResult, 'analysisDate'> {
    return {
      pros: [
        "Proximity to Mysore Road and NICE corridor - good connectivity",
        "More affordable land prices - attractive entry point for investors",
        "Developing manufacturing and logistics hubs create employment",
        "Upcoming Namma Metro Purple Line extension improves accessibility",
        "Large land parcels still available for development projects"
      ],
      cons: [
        "Relatively underdeveloped social infrastructure",
        "Distance from major IT employment hubs (Whitefield, Electronic City)",
        "Limited premium residential projects in the area",
        "Industrial character in some pockets affects residential appeal",
        "Longer commute times to central business districts"
      ],
      riskLevel: 'Medium',
      recommendations: [
        "Focus on areas along planned metro alignment",
        "Verify road width and infrastructure quality",
        "Check for upcoming industrial or commercial projects nearby",
        "Plan for longer 5-7 year investment horizon",
        "Ensure clear title and RERA registration"
      ],
      confidence: 72
    };
  }

  private centralBangaloreAnalysis(pricePerSqft?: number): Omit<LandAnalysisResult, 'analysisDate'> {
    return {
      pros: [
        "Prime central location with excellent connectivity to all parts of city",
        "Mature infrastructure with premium schools, hospitals, and shopping",
        "High rental demand for both residential and commercial properties",
        "Metro connectivity to most major destinations",
        "Limited supply ensures steady value appreciation"
      ],
      cons: [
        pricePerSqft && pricePerSqft > 10000
          ? `Very high land cost at ₹${pricePerSqft}/sqft - premium central location pricing`
          : "Extremely high land acquisition costs - prohibitive for many investors",
        "Very limited availability of developable land parcels",
        "Traffic congestion and parking challenges in most areas",
        "Older buildings and infrastructure requiring renovation",
        "Lower appreciation percentage compared to emerging corridors"
      ],
      riskLevel: 'Low',
      recommendations: [
        "Verify clear title - central properties often have complex ownership histories",
        "Check FSI (Floor Space Index) and development permissions carefully",
        "Consider renovation/redevelopment potential in older areas",
        "Evaluate commercial potential - may offer better ROI than residential",
        "Compare with recent transactions - prices vary significantly by micro-location"
      ],
      confidence: 90
    };
  }

  private suburbanAnalysis(
    distanceFromCity: number, 
    nearestITHub: { name: string; distance: number },
    pricePerSqft?: number
  ): Omit<LandAnalysisResult, 'analysisDate'> {
    return {
      pros: [
        `Balanced location - ${distanceFromCity.toFixed(1)} km from city center`,
        `Proximity to ${nearestITHub.name} IT hub (${nearestITHub.distance.toFixed(1)} km)`,
        pricePerSqft && pricePerSqft < 5000
          ? `Attractive entry price at ₹${pricePerSqft}/sqft`
          : "More affordable than prime corridors with growth potential",
        "Developing infrastructure with improving road connectivity",
        "Lower competition from institutional buyers in suburban zones"
      ],
      cons: [
        "Infrastructure development pace uncertain - depends on government plans",
        "Limited immediate social amenities - schools, hospitals still developing",
        "Public transport connectivity may be limited",
        "Resale liquidity could be moderate in near term (2-3 years)",
        "Value appreciation depends on nearby infrastructure projects"
      ],
      riskLevel: 'Medium',
      recommendations: [
        "Thoroughly verify title documents and check for legal disputes",
        "Research BDA/BMRDA master plans for upcoming infrastructure",
        "Plan for minimum 4-6 year investment horizon",
        "Verify availability of basic utilities (electricity, water, drainage)",
        "Visit the area multiple times at different hours to assess ground reality"
      ],
      confidence: 75
    };
  }

  private peripheralAnalysis(
    distanceFromCity: number,
    nearestITHub: { name: string; distance: number },
    pricePerSqft?: number
  ): Omit<LandAnalysisResult, 'analysisDate'> {
    const isVeryFar = distanceFromCity > 40;
    
    return {
      pros: [
        pricePerSqft && pricePerSqft < 3000
          ? `Very low entry price at ₹${pricePerSqft}/sqft - affordable investment`
          : "Significantly lower land prices - accessible to more investors",
        "Large land parcels available for development projects",
        "Lower competition from established developers",
        "Potential for high percentage returns if area develops",
        "Opportunity for early-mover advantage in emerging zones"
      ],
      cons: [
        `Considerable distance from city (${distanceFromCity.toFixed(1)} km) - long commute`,
        `Far from nearest IT hub ${nearestITHub.name} (${nearestITHub.distance.toFixed(1)} km)`,
        "Minimal infrastructure and social amenities currently available",
        "High uncertainty about development timeline - could take 7-10 years",
        isVeryFar 
          ? "Very limited resale liquidity - may be difficult to exit investment"
          : "Limited resale liquidity in short to medium term"
      ],
      riskLevel: isVeryFar ? 'High' : 'Medium',
      recommendations: [
        "Conduct exhaustive legal due diligence - verify ownership chain thoroughly",
        "Research government master plans (BDA/BMRDA/BBMP) for future development",
        "Plan for very long 7-10 year investment horizon - not for short-term gains",
        "Verify land use classification and conversion possibilities",
        "Consider only if aligned with long-term wealth creation goals and risk tolerance"
      ],
      confidence: isVeryFar ? 60 : 70
    };
  }
}

// Export singleton instance
export const freeRiskAnalysis = new FreeRiskAnalysisService();

// React Hook for easy integration
import { useState } from 'react';

export function useFreeRiskAnalysis() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<LandAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = async (locationData: LocationData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate brief processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const result = await freeRiskAnalysis.analyzeLandParcel(locationData);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze land parcel');
    } finally {
      setLoading(false);
    }
  };

  return { analysis, loading, error, fetchAnalysis };
}