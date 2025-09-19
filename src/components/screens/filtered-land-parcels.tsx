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
  DollarSign
} from "lucide-react";

interface FilteredLandParcelsProps {
  filters: any;
  onBack: () => void;
  onViewDetails: (parcelId: string) => void;
}

export function FilteredLandParcels({ filters, onBack, onViewDetails }: FilteredLandParcelsProps) {
  const landParcels = [
    {
      id: "1",
      location: "Devanahalli North",
      keyReasons: "Near Airport (12km), Excellent Infrastructure, Future Aerospace Park",
      las: 9.2,
      vas: 8.8,
      overall: 8.5,
      pricePerSqm: 4500,
      recommended: true
    },
    {
      id: "2", 
      location: "Sarjapur Road",
      keyReasons: "IT Corridor Hub, Multiple Townships, Good Connectivity",
      las: 8.5,
      vas: 7.1,
      overall: 7.8,
      pricePerSqm: 6200,
      recommended: true
    },
    {
      id: "3",
      location: "Electronic City Phase II",
      keyReasons: "Established IT Hub, Metro Connectivity, Infrastructure Ready",
      las: 8.1,
      vas: 7.3,
      overall: 7.2,
      pricePerSqm: 5800,
      recommended: false
    },
    {
      id: "4",
      location: "Hoskote Main Road", 
      keyReasons: "Affordable Pricing, Upcoming Development, Good ROI Potential",
      las: 6.5,
      vas: 8.3,
      overall: 6.9,
      pricePerSqm: 3200,
      recommended: false
    },
    {
      id: "5",
      location: "Whitefield Extension",
      keyReasons: "Tech Hub Proximity, Educational Institutions, Metro Extension",
      las: 7.8,
      vas: 7.5,
      overall: 7.6,
      pricePerSqm: 5500,
      recommended: true
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header title="Land Parcels Matching Your Criteria" showBackButton onBack={onBack} />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Enhanced Evaluation with LAS & VAS
            </h1>
            <p className="text-muted-foreground">
              Professional land assessment with comprehensive scoring system
            </p>
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
                    Location quality, infrastructure, connectivity, and future development potential
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
        </div>

        {/* Recommended Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Star className="h-6 w-6 text-warning" />
            Recommended Land Parcels - Enhanced Evaluation
          </h2>
          
          <div className="space-y-4">
            {landParcels.map((parcel, index) => (
              <Card 
                key={parcel.id}
                className={`shadow-card transition-smooth hover:shadow-glow ${
                  parcel.recommended ? 'ring-2 ring-primary/20' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                    {/* Rank & Recommended Badge */}
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

                    {/* Location */}
                    <div className="lg:col-span-2">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold text-foreground">{parcel.location}</h3>
                      </div>
                    </div>

                    {/* Key Reasons */}
                    <div className="lg:col-span-4">
                      <p className="text-sm text-muted-foreground">{parcel.keyReasons}</p>
                    </div>

                    {/* Scores */}
                    <div className="lg:col-span-3 flex items-center gap-3">
                      <ScoreBadge score={parcel.las} label="LAS" size="sm" />
                      <ScoreBadge score={parcel.vas} label="VAS" size="sm" />
                      <ScoreBadge score={parcel.overall} label="Overall" size="sm" />
                    </div>

                    {/* Price & Action */}
                    <div className="lg:col-span-2 flex items-center gap-3">
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-sm font-semibold text-success">
                          <DollarSign className="h-4 w-4" />
                          ₹{parcel.pricePerSqm.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">per sq.m</p>
                      </div>
                      <Button 
                        size="sm" 
                        className="primary-gradient shadow-button"
                        onClick={() => onViewDetails(parcel.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Applied Filters Summary */}
        {(filters?.townships?.length > 0 || filters?.infrastructure?.length > 0 || filters?.news?.length > 0 || filters?.ads?.length > 0) && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Applied Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filters.townships?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Townships:</p>
                    <div className="flex flex-wrap gap-2">
                      {filters.townships.map((township: string, index: number) => (
                        <Badge key={index} variant="outline" className="bg-primary/10 text-primary border-primary/30">
                          {township}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {filters.infrastructure?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Infrastructure:</p>
                    <div className="flex flex-wrap gap-2">
                      {filters.infrastructure.map((infra: string, index: number) => (
                        <Badge key={index} variant="outline" className="bg-success/10 text-success border-success/30 capitalize">
                          {infra}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}