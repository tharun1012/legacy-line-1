import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/ui/feature-card";
import { Header } from "@/components/layout/header";
import { MapPin, Search, Navigation, Target } from "lucide-react";
import heroBackground from "@/assets/hero-background.jpg";

interface MainNavigationProps {
  onAccessLandParcel: () => void;
  onDiscoverLandParcel: () => void;
}

export function MainNavigation({ onAccessLandParcel, onDiscoverLandParcel }: MainNavigationProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <div 
        className="relative h-[60vh] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(${heroBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 hero-gradient opacity-90" />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            Legacy Line
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto font-light">
            Land Parcel Assessment Tool
          </p>
          <p className="text-lg opacity-90 max-w-3xl mx-auto leading-relaxed">
            Professional land evaluation with comprehensive infrastructure analysis, 
            investment scoring, and future development potential assessment
          </p>
        </div>
      </div>

      {/* Main Options */}
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Choose Your Assessment Method
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Access specific land parcels directly or discover new opportunities through our comprehensive database
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <FeatureCard
            title="Access a Land Parcel"
            description="Enter specific coordinates or paste Google Maps link for detailed parcel analysis"
            icon={<Target className="h-6 w-6" />}
            variant="gradient"
            clickable
            onClick={onAccessLandParcel}
            className="h-full"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Navigation className="h-4 w-4 text-primary" />
                <span>GPS coordinates or map links</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Automatic coordinate extraction</span>
              </div>
              <Button 
                className="w-full mt-6 primary-gradient shadow-button hover:shadow-glow"
                onClick={onAccessLandParcel}
              >
                Enter Coordinates
              </Button>
            </div>
          </FeatureCard>

          <FeatureCard
            title="Discover Land Parcel"
            description="Browse and filter available parcels with our advanced search and recommendation system"
            icon={<Search className="h-6 w-6" />}
            variant="gradient"
            clickable
            onClick={onDiscoverLandParcel}
            className="h-full"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Search className="h-4 w-4 text-success" />
                <span>Advanced filtering options</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Target className="h-4 w-4 text-success" />
                <span>LAS & VAS scoring system</span>
              </div>
              <Button 
                className="w-full mt-6 success-gradient shadow-button hover:shadow-glow"
                onClick={onDiscoverLandParcel}
              >
                Browse Parcels
              </Button>
            </div>
          </FeatureCard>
        </div>

        {/* Feature Highlights */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <div className="text-center p-6">
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Precise Location Analysis</h3>
            <p className="text-sm text-muted-foreground">GPS-based coordinate system with map integration</p>
          </div>
          
          <div className="text-center p-6">
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
              <Target className="h-8 w-8 text-success" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Smart Scoring System</h3>
            <p className="text-sm text-muted-foreground">LAS & VAS algorithms for comprehensive evaluation</p>
          </div>
          
          <div className="text-center p-6">
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-warning/10 flex items-center justify-center">
              <Search className="h-8 w-8 text-warning" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Market Intelligence</h3>
            <p className="text-sm text-muted-foreground">Real-time data on infrastructure and development</p>
          </div>
        </div>
      </div>
    </div>
  );
}