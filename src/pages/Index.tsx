import { useState } from "react";
import { MainNavigation } from "@/components/screens/main-navigation";
import { LandParcelEntry } from "@/components/screens/land-parcel-entry";
import { AssessmentDashboard } from "@/components/screens/assessment-dashboard";
import LandParcelDiscovery from "@/components/screens/land-parcel-discovery";
import { FilteredLandParcels } from "@/components/screens/filtered-land-parcels";
import { DetailedLandParcelAnalysis } from "@/components/screens/detailed-land-parcel-analysis";

type Screen = 
  | "main" 
  | "land-entry" 
  | "assessment" 
  | "discovery" 
  | "filtered-results"
  | "detailed-analysis";

interface AssessmentData {
  googleMapLink: string;
  latitude: string;
  longitude: string;
}

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("main");
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [discoveryFilters, setDiscoveryFilters] = useState<any>(null);
  const [selectedParcelId, setSelectedParcelId] = useState<string | null>(null);

  const handleAccessLandParcel = () => {
    setCurrentScreen("land-entry");
  };

  const handleDiscoverLandParcel = () => {
    setCurrentScreen("discovery");
  };

  const handleBackToMain = () => {
    setCurrentScreen("main");
    setAssessmentData(null);
    setDiscoveryFilters(null);
    setSelectedParcelId(null);
  };

  const handleContinueToAssessment = (data: AssessmentData) => {
    setAssessmentData(data);
    setCurrentScreen("assessment");
  };

  const handleBackToEntry = () => {
    setCurrentScreen("land-entry");
  };

  const handleBackToDiscovery = () => {
    setCurrentScreen("discovery");
  };

  const handleDiscoveryComplete = (filters: any) => {
    setDiscoveryFilters(filters);
    setCurrentScreen("filtered-results");
  };

  const handleViewParcelDetails = (parcelId: string) => {
    setSelectedParcelId(parcelId);
    setCurrentScreen("detailed-analysis");
  };

  const handleBackToFilteredResults = () => {
    setCurrentScreen("filtered-results");
    setSelectedParcelId(null);
  };

  switch (currentScreen) {
    case "land-entry":
      return (
        <LandParcelEntry
          onBack={handleBackToMain}
          onContinue={handleContinueToAssessment}
        />
      );

    case "assessment":
      return assessmentData ? (
        <AssessmentDashboard
          data={assessmentData}
          onBack={handleBackToEntry}
        />
      ) : null;

    case "detailed-analysis":
      return selectedParcelId ? (
        <DetailedLandParcelAnalysis
          parcelId={selectedParcelId}
          onBack={handleBackToFilteredResults}
        />
      ) : null;

    case "discovery":
      return (
        <LandParcelDiscovery
          onBack={handleBackToMain}
          onDiscover={handleDiscoveryComplete}
        />
      );

    case "filtered-results":
      return discoveryFilters ? (
        <FilteredLandParcels
          filters={discoveryFilters}
          onBack={handleBackToDiscovery}
          onViewDetails={handleViewParcelDetails}
        />
      ) : null;

    default:
      return (
        <MainNavigation
          onAccessLandParcel={handleAccessLandParcel}
          onDiscoverLandParcel={handleDiscoverLandParcel}
        />
      );
  }
};

export default Index;
