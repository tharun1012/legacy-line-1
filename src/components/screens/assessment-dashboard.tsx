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

interface AssessmentData {
  googleMapLink: string;
  latitude: string;
  longitude: string;
}

interface AssessmentDashboardProps {
  data: AssessmentData;
  onBack: () => void;
}

export function AssessmentDashboard({ data, onBack }: AssessmentDashboardProps) {
  const assessmentData = {
    transportation: {
      airport: { distance: "15 km", name: "Kempegowda International Airport" },
      busStand: { distance: "3 km", name: "Electronic City Bus Terminal" }
    },
    builderProjects: [
      { name: "Residential Complex", distance: "2km", type: "Residential" },
      { name: "Shopping Mall", distance: "5km", type: "Commercial" },
      { name: "School District", distance: "3km", type: "Educational" }
    ],
    infrastructure: {
      roads: "Available",
      power: "Connected",
      water: "Municipal",
      internet: "Fiber"
    },
    scores: {
      las: 8.5,
      vas: 7.8,
      overall: 8.1
    }
  };

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
              <ScoreBadge score={assessmentData.scores.overall} label="Overall Score" size="lg" />
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
                    <span className="text-sm font-medium">Nearest Airport</span>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    {assessmentData.transportation.airport.distance}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bus className="h-4 w-4 text-success" />
                    <span className="text-sm font-medium">Bus Stand</span>
                  </div>
                  <span className="text-sm font-semibold text-success">
                    {assessmentData.transportation.busStand.distance}
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
                {assessmentData.builderProjects.map((project, index) => {
                  const icons = [Home, ShoppingCart, School];
                  const Icon = icons[index];
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
                    {assessmentData.infrastructure.roads}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Zap className="h-4 w-4 text-warning" />
                    <span className="text-sm font-medium">Power</span>
                  </div>
                  <span className="text-sm font-semibold text-success">
                    {assessmentData.infrastructure.power}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Droplets className="h-4 w-4 text-warning" />
                    <span className="text-sm font-medium">Water</span>
                  </div>
                  <span className="text-sm font-semibold text-success">
                    {assessmentData.infrastructure.water}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Wifi className="h-4 w-4 text-warning" />
                    <span className="text-sm font-medium">Internet</span>
                  </div>
                  <span className="text-sm font-semibold text-success">
                    {assessmentData.infrastructure.internet}
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
                <ScoreBadge score={assessmentData.scores.las} size="lg" className="mb-3" />
                <p className="text-sm text-muted-foreground">
                  Location quality, infrastructure, connectivity, and future development potential
                </p>
              </div>
              
              <div className="text-center p-6 bg-muted/30 rounded-lg">
                <h3 className="font-semibold mb-2">VAS (Value Assessment Score)</h3>
                <ScoreBadge score={assessmentData.scores.vas} size="lg" className="mb-3" />
                <p className="text-sm text-muted-foreground">
                  Investment value, cost-benefit ratio, market appreciation potential
                </p>
              </div>
              
              <div className="text-center p-6 bg-muted/30 rounded-lg">
                <h3 className="font-semibold mb-2">Overall Score</h3>
                <ScoreBadge score={assessmentData.scores.overall} size="lg" className="mb-3" />
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