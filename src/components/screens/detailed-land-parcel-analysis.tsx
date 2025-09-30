import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { ScoreBadge } from "@/components/ui/score-badge";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Heart,
  Printer,
  ArrowLeft,
  Home,
  Plane,
  Building2,
  School,
  Hospital,
  ShoppingCart,
  Banknote,
  Navigation2,
  AlertTriangle,
  CheckCircle,
  DollarSign
} from "lucide-react";
import MapView from "@/components/Mapview"; // ✅ accepts lat/lng props

interface DetailedLandParcelAnalysisProps {
  parcelId: string;
  onBack: () => void;
}

export function DetailedLandParcelAnalysis({ parcelId, onBack }: DetailedLandParcelAnalysisProps) {
  const parcelData = {
    location: "Devanahalli North",
    lat: 13.1986,
    lng: 77.7101,
    surveyNo: "45/2, Devanahalli, Bangalore Rural District",
    scores: { las: 9.2, vas: 8.8, overall: 8.5, infrastructureRating: 4.2 },
    pricing: { costPerSqm: 4500, plotSize: 2400, totalCost: 1008000, registration: 65000, totalInvestment: 1073000 },
    distances: {
      airport: { name: "Kempegowda International Airport", distance: "12.5 km" },
      prestige: { name: "Prestige Lakeside Habitat", distance: "8.2 km" },
      businessPark: { name: "Devanahalli Business Park", distance: "3.1 km" },
      town: { name: "Devanahalli Town", distance: "4.1 km" },
      city: { name: "Bangalore City", distance: "52 km" }
    },
    infrastructure: {
      roads: { status: "Excellent", icon: CheckCircle, color: "text-success" },
      power: { status: "Connected", icon: CheckCircle, color: "text-success" },
      water: { status: "BWSSB", icon: CheckCircle, color: "text-success" },
      internet: { status: "Fiber Ready", icon: CheckCircle, color: "text-success" },
      drainage: { status: "Planned", icon: AlertTriangle, color: "text-warning" }
    },
    amenities: {
      transportation: [
        { name: "Airport", distance: "12.5 km", detail: "18 min drive", icon: Plane },
        { name: "Bus Stand", distance: "4.1 km", detail: "", icon: Navigation2 },
        { name: "Railway", distance: "6 km", detail: "Devanahalli Station", icon: Navigation2 },
        { name: "Highway", distance: "2.8 km", detail: "NH44", icon: Navigation2 }
      ],
      education: [
        { name: "Delhi Public School", distance: "5.2 km", detail: "", icon: School },
        { name: "Akash International", distance: "3.8 km", detail: "", icon: School },
        { name: "Apollo Clinic", distance: "4.5 km", detail: "", icon: Hospital },
        { name: "District Hospital", distance: "6.1 km", detail: "", icon: Hospital }
      ],
      commercial: [
        { name: "Devanahalli Business Park", distance: "3.1 km", detail: "", icon: Building2 },
        { name: "Local Market", distance: "4.0 km", detail: "", icon: ShoppingCart },
        { name: "Reliance Fresh", distance: "3.7 km", detail: "", icon: ShoppingCart },
        { name: "ATM/Banks", distance: "4.2 km", detail: "", icon: Banknote }
      ],
      future: [
        { name: "Aerospace Park", distance: "8 km", detail: "", icon: Plane },
        { name: "Proposed IT SEZ", distance: "5.5 km", detail: "", icon: Building2 },
        { name: "New Township Phase", distance: "2 km", detail: "", icon: Home },
        { name: "Ring Road Extension", distance: "3 km", detail: "", icon: Navigation2 }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Detailed Land Parcel Analysis" showBackButton onBack={onBack} />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header & Scores */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Land Parcel Analysis - {parcelData.location}
          </h1>
          <p className="text-muted-foreground">Survey No: {parcelData.surveyNo}</p>
        </div>

        <Card className="shadow-card mb-6">
          <CardContent className="p-6 grid md:grid-cols-5 gap-6 text-center items-center">
            <div>
              <h3 className="font-semibold mb-2">Overall Score</h3>
              <ScoreBadge score={parcelData.scores.overall} size="lg" className="mb-2" />
              <p className="text-sm text-success font-medium">Excellent Investment</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Infrastructure Rating</h3>
              <div className="flex items-center justify-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(parcelData.scores.infrastructureRating)
                        ? "text-warning fill-warning"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">{parcelData.scores.infrastructureRating}/5 stars</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Cost per sq meter</h3>
              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-success mb-2">
                <DollarSign className="h-6 w-6" />
                ₹{parcelData.pricing.costPerSqm.toLocaleString()}
              </div>
              <p className="text-sm text-success">Below market average</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">LAS Score</h3>
              <ScoreBadge score={parcelData.scores.las} size="lg" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">VAS Score</h3>
              <ScoreBadge score={parcelData.scores.vas} size="lg" />
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Bangalore Location Map</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="aspect-square rounded-lg overflow-hidden">
                  <MapView lat={parcelData.lat} lng={parcelData.lng} />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Investment Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plot Size:</span>
                  <span className="font-medium">{parcelData.pricing.plotSize.toLocaleString()} sq ft</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Cost:</span>
                  <span className="font-medium">₹{(parcelData.pricing.totalCost / 100000).toFixed(1)}L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Registration:</span>
                  <span className="font-medium">₹{(parcelData.pricing.registration / 1000)}K</span>
                </div>
                <div className="flex justify-between font-semibold text-primary">
                  <span>Total Investment:</span>
                  <span>₹{(parcelData.pricing.totalInvestment / 100000).toFixed(2)}L</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Distance Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.values(parcelData.distances).map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                    <span className="text-sm">{item.name}:</span>
                    <span className="font-medium text-primary">{item.distance}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Middle Column */}
          <div>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Infrastructure Score</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(parcelData.infrastructure).map(([key, item]) => {
                  const Icon = item.icon;
                  return (
                    <div key={key} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${item.color}`} />
                        <span className="font-medium capitalize">{key}:</span>
                      </div>
                      <span className={`font-semibold ${item.color}`}>{item.status}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {Object.entries(parcelData.amenities).map(([category, items]) => (
              <Card key={category} className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-base capitalize">
                    {category === "future" ? "Future Developments" : category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {items.map((item: any, idx: number) => {
                    const Icon = item.icon;
                    return (
                      <div key={idx} className="flex items-center gap-3 p-2 bg-muted/20 rounded">
                        <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium truncate">{item.name}</span>
                            <span className="text-xs text-primary font-medium ml-2">{item.distance}</span>
                          </div>
                          {item.detail && <p className="text-xs text-muted-foreground">{item.detail}</p>}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button variant="outline" className="gap-2">
            <Printer className="h-4 w-4" />
            Print Report
          </Button>
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Results
          </Button>
          <Button className="gap-2 success-gradient shadow-button">
            <Heart className="h-4 w-4" />
            Save to Favorites
          </Button>
        </div>
      </div>
    </div>
  );
}
