import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Building2, Zap, TrendingUp, Star, Search, ArrowLeft } from "lucide-react";

interface LandParcelDiscoveryProps {
  onBack?: () => void;
  onDiscover?: (filters: any) => void;
}

export default function LandParcelDiscovery({ onBack, onDiscover }: LandParcelDiscoveryProps) {
  const [view, setView] = useState<"places" | "filters">("places");
  
  const [allPlaces] = useState<any[]>([
    { name: "Indiranagar", latitude: 12.9719, longitude: 77.6412 },
    { name: "JP Nagar", latitude: 12.9082, longitude: 77.5855 },
    { name: "Whitefield", latitude: 12.9698, longitude: 77.7499 },
    { name: "Sarjapur", latitude: 12.8813, longitude: 77.7612 },
    { name: "Electronic City", latitude: 12.8451, longitude: 77.6602 },
    { name: "Koramangala", latitude: 12.9352, longitude: 77.6245 },
    { name: "Devanahalli", latitude: 13.2426, longitude: 77.7085 },
    { name: "Marathahalli", latitude: 12.9591, longitude: 77.6974 },
    { name: "Mahadevapura", latitude: 12.9897, longitude: 77.6978 },
    { name: "Hebbal", latitude: 13.0358, longitude: 77.597 },
    { name: "Yelahanka", latitude: 13.1007, longitude: 77.5963 },
    { name: "HSR Layout", latitude: 12.9121, longitude: 77.6446 },
    { name: "BTM Layout", latitude: 12.9165, longitude: 77.6101 },
    { name: "Jayanagar", latitude: 12.925, longitude: 77.5838 },
    { name: "Banashankari", latitude: 12.925, longitude: 77.5487 },
    { name: "Malleshwaram", latitude: 13.0038, longitude: 77.5703 },
    { name: "Rajajinagar", latitude: 12.9915, longitude: 77.5528 },
    { name: "Vijayanagar", latitude: 12.9716, longitude: 77.5344 },
    { name: "Basavanagudi", latitude: 12.9423, longitude: 77.5738 },
    { name: "Bellandur", latitude: 12.9259, longitude: 77.6789 },
    { name: "Bannerghatta", latitude: 12.8004, longitude: 77.5773 },
    { name: "Basaveshwara Nagar", latitude: 12.9886, longitude: 77.5406 },
    { name: "Benson Town", latitude: 13.0097, longitude: 77.6084 },
    { name: "Shantinagar", latitude: 12.9698, longitude: 77.6043 },
    { name: "Seshadripuram", latitude: 12.9899, longitude: 77.5767 },
    { name: "Yeshwanthpur", latitude: 13.0285, longitude: 77.5389 },
  ]);

  const [filteredPlaces, setFilteredPlaces] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [allTownshipData] = useState<any[]>([
    { name: "Adarsh Savana", latitude: 12.9719, longitude: 77.6412 },
    { name: "Adithya Homes Paradise", latitude: 12.9720, longitude: 77.6420 },
    { name: "Ajmal Flora Valley", latitude: 12.9710, longitude: 77.6400 },
    { name: "Arvind Lakeview", latitude: 12.9730, longitude: 77.6430 },
    { name: "Arvind The Park", latitude: 12.9700, longitude: 77.6390 },
    { name: "Assetz The Secret Lake", latitude: 12.9690, longitude: 77.6380 },
    { name: "BDA Layout", latitude: 12.9740, longitude: 77.6440 },
  ]);
  
  const [news] = useState<string[]>([
    "South City Commissioner directs scrutiny of property tax declarations of large multi-storey buildings",
    "33k property owners in Bengaluru to get power, water connections",
    "Bengaluru real estate operator murder: Police search properties of businessman linked to key accused",
    "Bengaluru resident shares costly findings",
  ]);

  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [selectedTownships, setSelectedTownships] = useState<string[]>([]);
  const [selectedInfrastructure, setSelectedInfrastructure] = useState<string[]>([]);
  const [selectedNews, setSelectedNews] = useState<string[]>([]);
  const [selectedAds, setSelectedAds] = useState<string[]>([]);
  const [isApplying, setIsApplying] = useState(false);

  const infrastructure = [
    "Roads",
    "Power",
    "Water",
    "Internet",
    "Drainage",
    "Parks",
    "Street Lights",
    "Security",
  ];

  const realEstateAds = [
    "Premium Plots in Devanahalli",
    "Residential Land Near Airport",
    "BMRDA Approved Sites",
    "Investment Opportunities",
    "Gated Community Plots",
    "Ready to Construct Land",
  ];

  useEffect(() => {
    setFilteredPlaces(allPlaces);
  }, [allPlaces]);

  const handleSearchChange = (e: any) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredPlaces(allPlaces);
    } else {
      setFilteredPlaces(
        allPlaces.filter((p) =>
          p.name.toLowerCase().includes(query.toLowerCase())
        )
      );
    }
  };

  const handlePlaceSelect = (place: any) => {
    setSelectedPlace(place);
    setView("filters");
  };

  const toggleSelection = (list: string[], setList: any, value: string) => {
    setList(
      list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value]
    );
  };

  const handleApplyFilters = () => {
    if (isApplying) return;
    setIsApplying(true);

    const filters = {
      place: selectedPlace?.name,
      townships: selectedTownships,
      infrastructure: selectedInfrastructure,
      news: selectedNews,
      ads: selectedAds,
    };

    if (onDiscover) {
      onDiscover(filters);
    }
  };

  const handleBackToPlaces = () => {
    setView("places");
    setIsApplying(false);
  };

  // FILTERS VIEW
  if (view === "filters") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <Button
              variant="ghost"
              onClick={handleBackToPlaces}
              className="text-blue-600 hover:text-blue-700"
            >
              ← Change Location
            </Button>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Apply Filters</h1>
          <p className="text-slate-600 mb-8">
            Refine your search with additional filters for <strong>{selectedPlace?.name}</strong>
          </p>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {/* Townships */}
            <FilterCard
              title="Townships"
              icon={<Building2 className="w-5 h-5 text-blue-600" />}
              color="blue"
              data={allTownshipData.map((t) => t.name)}
              selected={selectedTownships}
              toggle={(v: string) => toggleSelection(selectedTownships, setSelectedTownships, v)}
              emptyText="No townships available"
            />

            {/* Infrastructure */}
            <FilterCard
              title="Infrastructure"
              icon={<Zap className="w-5 h-5 text-emerald-600" />}
              color="emerald"
              data={infrastructure}
              selected={selectedInfrastructure}
              toggle={(v: string) =>
                toggleSelection(selectedInfrastructure, setSelectedInfrastructure, v)
              }
            />

            {/* News */}
            <FilterCard
              title="Real Estate News"
              icon={<TrendingUp className="w-5 h-5 text-amber-600" />}
              color="amber"
              data={news}
              selected={selectedNews}
              toggle={(v: string) => toggleSelection(selectedNews, setSelectedNews, v)}
              emptyText="No news available"
            />

            {/* Ads */}
            <FilterCard
              title="Real Estate Ads"
              icon={<Star className="w-5 h-5 text-purple-600" />}
              color="purple"
              data={realEstateAds}
              selected={selectedAds}
              toggle={(v: string) => toggleSelection(selectedAds, setSelectedAds, v)}
            />
          </div>

          <div className="flex gap-4 justify-between">
            <Button variant="outline" size="lg" onClick={handleBackToPlaces} className="px-8">
              Back
            </Button>
            <Button
              onClick={handleApplyFilters}
              size="lg"
              disabled={isApplying}
              className="bg-blue-600 hover:bg-blue-700 text-white px-12 disabled:opacity-50"
            >
              {isApplying ? "Processing..." : "Apply Filters & Search"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // PLACES VIEW (Second Screenshot)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="icon" className="rounded-full" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search locations..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 py-6 text-lg"
          />
        </div>

        <p className="text-slate-500 text-sm mb-6">
          Found {filteredPlaces.length} locations
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          {filteredPlaces.map((place) => (
            <Card
              key={place.name}
              className="cursor-pointer hover:shadow-lg transition-all border-2 border-slate-200 hover:border-blue-500"
              onClick={() => handlePlaceSelect(place)}
            >
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-slate-800">{place.name}</span>
                </div>
                <span className="text-blue-600">→</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Helper Reusable Card ---
function FilterCard({
  title,
  icon,
  color,
  data,
  selected,
  toggle,
  emptyText,
}: {
  title: string;
  icon: any;
  color: string;
  data: string[];
  selected: string[];
  toggle: (v: string) => void;
  emptyText?: string;
}) {
  const getBorderColor = () => {
    if (selected.length === 0) return "border-slate-200";
    switch(color) {
      case "blue": return "border-blue-500 ring-2 ring-blue-200";
      case "emerald": return "border-emerald-500 ring-2 ring-emerald-200";
      case "amber": return "border-amber-500 ring-2 ring-amber-200";
      case "purple": return "border-purple-500 ring-2 ring-purple-200";
      default: return "border-slate-200";
    }
  };

  const getBadgeColor = () => {
    switch(color) {
      case "blue": return "bg-blue-600 text-white";
      case "emerald": return "bg-emerald-600 text-white";
      case "amber": return "bg-amber-600 text-white";
      case "purple": return "bg-purple-600 text-white";
      default: return "bg-slate-600 text-white";
    }
  };

  return (
    <Card className={`shadow-lg rounded-xl border-2 transition-all ${getBorderColor()}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 font-semibold text-slate-800">
          {icon}
          {title}
          {selected.length > 0 && (
            <Badge className={`${getBadgeColor()} ml-auto`}>
              {selected.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-80 overflow-y-auto">
        {data.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-4">
            {emptyText || "No data available"}
          </p>
        ) : (
          data.map((item) => (
            <label
              key={item}
              className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all bg-slate-50 hover:bg-slate-100"
            >
              <input
                type="checkbox"
                checked={selected.includes(item)}
                onChange={() => toggle(item)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-slate-700">{item}</span>
            </label>
          ))
        )}
      </CardContent>
    </Card>
  );
}