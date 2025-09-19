import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import { 
  Building2, 
  Zap, 
  TrendingUp, 
  Star, 
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LandParcelDiscoveryProps {
  onBack: () => void;
  onDiscover: (filters: any) => void;
}

export function LandParcelDiscovery({ onBack, onDiscover }: LandParcelDiscoveryProps) {
  const [selectedTownships, setSelectedTownships] = useState<string[]>([]);
  const [selectedInfrastructure, setSelectedInfrastructure] = useState<string[]>([]);
  const [selectedNews, setSelectedNews] = useState<string[]>([]);
  const [selectedAds, setSelectedAds] = useState<string[]>([]);

  const townships = [
    "Prestige Lakeside Habitat",
    "Brigade Cornerstone Utopia", 
    "Sobha Dream Acres",
    "Godrej Reserve",
    "Shriram Greenfield",
    "Adarsh Palm Retreat",
    "Embassy Springs",
    "Puravankara Purva Land"
  ];

  const infrastructure = [
    "Roads", "Power", "Water", "Internet", "Drainage", "Parks", "Street Lights", "Security"
  ];

  const realEstateNews = [
    "Bangalore Land Prices Rise 15%",
    "New IT Parks in Electronic City",
    "Infrastructure Development Updates",
    "Airport Connectivity Improvements",
    "Metro Line Extensions",
    "New Educational Institutes"
  ];

  const realEstateAds = [
    "Premium Plots in Devanahalli",
    "Residential Land Near Airport",
    "BMRDA Approved Sites",
    "Investment Opportunities",
    "Gated Community Plots",
    "Ready to Construct Land"
  ];

  const toggleSelection = (list: string[], setList: (v: string[]) => void, value: string) => {
    if (list.includes(value)) {
      setList(list.filter(item => item !== value));
    } else {
      setList([...list, value]);
    }
  };

  const handleDiscover = () => {
    onDiscover({
      townships: selectedTownships,
      infrastructure: selectedInfrastructure,
      news: selectedNews,
      ads: selectedAds
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header title="Discover & Filter Land Parcels" showBackButton onBack={onBack} />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Townships */}
          <Card className={cn("shadow-card rounded-xl border", selectedTownships.length > 0 && "border-primary")}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 font-semibold">
                <Building2 className="w-5 h-5 text-primary" />
                Townships
                {selectedTownships.length > 0 && (
                  <Badge className="bg-primary text-primary-foreground ml-2">
                    {selectedTownships.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {townships.map((t) => (
                <div
                  key={t}
                  className={cn(
                    "px-3 py-2 rounded-md cursor-pointer transition text-sm font-medium",
                    selectedTownships.includes(t)
                      ? "bg-primary text-white"
                      : "hover:bg-muted"
                  )}
                  onClick={() => toggleSelection(selectedTownships, setSelectedTownships, t)}
                >
                  {t}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Infrastructure */}
          <Card className={cn("shadow-card rounded-xl border", selectedInfrastructure.length > 0 && "border-primary")}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 font-semibold">
                <Zap className="w-5 h-5 text-blue-500" />
                Infrastructure
                {selectedInfrastructure.length > 0 && (
                  <Badge className="bg-primary text-primary-foreground ml-2">
                    {selectedInfrastructure.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {infrastructure.map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "px-3 py-2 rounded-md cursor-pointer transition flex items-center gap-2 font-medium",
                      selectedInfrastructure.includes(i)
                        ? "bg-primary text-white"
                        : "hover:bg-muted"
                    )}
                    onClick={() => toggleSelection(selectedInfrastructure, setSelectedInfrastructure, i)}
                  >
                    {i}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Real Estate News */}
          <Card className={cn("shadow-card rounded-xl border", selectedNews.length > 0 && "border-primary")}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 font-semibold">
                <TrendingUp className="w-5 h-5 text-yellow-500" />
                Real Estate News
                {selectedNews.length > 0 && (
                  <Badge className="bg-primary text-primary-foreground ml-2">
                    {selectedNews.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {realEstateNews.map((n) => (
                <div
                  key={n}
                  className={cn(
                    "px-3 py-2 rounded-md cursor-pointer transition text-sm font-medium",
                    selectedNews.includes(n)
                      ? "bg-primary text-white"
                      : "hover:bg-muted"
                  )}
                  onClick={() => toggleSelection(selectedNews, setSelectedNews, n)}
                >
                  {n}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Real Estate Ads */}
          <Card className={cn("shadow-card rounded-xl border", selectedAds.length > 0 && "border-primary")}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 font-semibold">
                <Star className="w-5 h-5 text-sky-500" />
                Real Estate Ads
                {selectedAds.length > 0 && (
                  <Badge className="bg-primary text-primary-foreground ml-2">
                    {selectedAds.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {realEstateAds.map((a) => (
                <div
                  key={a}
                  className={cn(
                    "px-3 py-2 rounded-md cursor-pointer transition text-sm font-medium",
                    selectedAds.includes(a)
                      ? "bg-primary text-white"
                      : "hover:bg-muted"
                  )}
                  onClick={() => toggleSelection(selectedAds, setSelectedAds, a)}
                >
                  {a}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Discover Button */}
        <div className="text-center">
          <Button
            onClick={handleDiscover}
            size="lg"
            className="animate-pulse-glow hover:scale-105 transition-all duration-300 rounded-lg px-6 py-3"
            disabled={
              selectedTownships.length === 0 &&
              selectedInfrastructure.length === 0 &&
              selectedNews.length === 0 &&
              selectedAds.length === 0
            }
          >
            <Search className="mr-2 w-5 h-5" />
            Discover{" "}
            {(selectedTownships.length + selectedInfrastructure.length + selectedNews.length + selectedAds.length) > 0 &&
              `(${selectedTownships.length + selectedInfrastructure.length + selectedNews.length + selectedAds.length} filters)`}
          </Button>
          {(selectedTownships.length === 0 &&
            selectedInfrastructure.length === 0 &&
            selectedNews.length === 0 &&
            selectedAds.length === 0) && (
            <p className="text-muted-foreground mt-2 text-sm">
              Please select at least one filter to discover parcels
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
