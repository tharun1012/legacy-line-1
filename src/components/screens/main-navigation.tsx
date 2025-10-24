import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/ui/feature-card";
import { Header } from "@/components/layout/header";
import { MapPin, Search, Navigation, Target, TrendingUp, Shield, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import heroBackground from "@/assets/hero-background.jpg";

interface MainNavigationProps {
  onAccessLandParcel: () => void;
  onDiscoverLandParcel: () => void;
}

export function MainNavigation({ onAccessLandParcel, onDiscoverLandParcel }: MainNavigationProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      
      {/* Hero Section with Enhanced Design */}
      <div 
        className="relative h-[70vh] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(${heroBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/95 via-indigo-900/90 to-purple-900/95" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 animate-fade-in">
            <Sparkles className="h-4 w-4 text-yellow-300" />
            <span className="text-sm font-medium">Professional Land Assessment Platform</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-extrabold mb-6 tracking-tight animate-fade-in-up">
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
              Legacy Line
            </span>
          </h1>
          
          <p className="text-2xl md:text-3xl mb-6 font-semibold text-blue-100 animate-fade-in-up delay-100">
            Land Parcel Assessment Tool
          </p>
          
          <p className="text-lg md:text-xl opacity-90 max-w-3xl mx-auto leading-relaxed text-slate-200 animate-fade-in-up delay-200">
            Transform your land investment decisions with AI-powered analysis, comprehensive infrastructure scoring, 
            and real-time market intelligence for smarter property evaluation
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-12 animate-fade-in-up delay-300">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <span>GPS Accurate</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <span>Real-time Data</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <span>AI-Powered Insights</span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white/60 rounded-full" />
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="container mx-auto px-4 py-20 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 mb-4">
            <Target className="h-4 w-4" />
            <span className="text-sm font-semibold">GET STARTED</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Choose Your Assessment Path
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Whether you have specific coordinates or want to explore opportunities, 
            we've got the perfect solution for your land assessment needs
          </p>
        </div>

        {/* Main Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
          {/* Access Card */}
          <div 
            onClick={onAccessLandParcel}
            className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer border border-slate-200 hover:border-blue-300 hover:-translate-y-2"
          >
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Content */}
            <div className="relative z-10 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-7 w-7 text-white" />
                </div>
                <ArrowRight className="h-6 w-6 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
              </div>

              <h3 className="text-2xl font-bold text-slate-900 group-hover:text-white mb-3 transition-colors duration-300">
                Access a Land Parcel
              </h3>
              
              <p className="text-slate-600 group-hover:text-white/90 mb-6 transition-colors duration-300">
                Enter specific coordinates or paste Google Maps link for instant detailed parcel analysis and scoring
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 group-hover:bg-white/20 flex items-center justify-center transition-colors duration-300">
                    <Navigation className="h-4 w-4 text-blue-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <span className="text-sm text-slate-700 group-hover:text-white transition-colors duration-300">
                    GPS coordinates or Google Maps links
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 group-hover:bg-white/20 flex items-center justify-center transition-colors duration-300">
                    <MapPin className="h-4 w-4 text-blue-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <span className="text-sm text-slate-700 group-hover:text-white transition-colors duration-300">
                    Automatic coordinate extraction
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 group-hover:bg-white/20 flex items-center justify-center transition-colors duration-300">
                    <Sparkles className="h-4 w-4 text-blue-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <span className="text-sm text-slate-700 group-hover:text-white transition-colors duration-300">
                    Instant comprehensive analysis
                  </span>
                </div>
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg group-hover:bg-white group-hover:text-blue-600 transition-all duration-300"
                onClick={onAccessLandParcel}
              >
                <span className="font-semibold">Enter Coordinates</span>
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </div>
          </div>

          {/* Discover Card */}
          <div 
            onClick={onDiscoverLandParcel}
            className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer border border-slate-200 hover:border-emerald-300 hover:-translate-y-2"
          >
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-green-500 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Content */}
            <div className="relative z-10 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Search className="h-7 w-7 text-white" />
                </div>
                <ArrowRight className="h-6 w-6 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
              </div>

              <h3 className="text-2xl font-bold text-slate-900 group-hover:text-white mb-3 transition-colors duration-300">
                Discover Land Parcel
              </h3>
              
              <p className="text-slate-600 group-hover:text-white/90 mb-6 transition-colors duration-300">
                Browse and filter available parcels with advanced search and intelligent recommendation algorithms
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 group-hover:bg-white/20 flex items-center justify-center transition-colors duration-300">
                    <Search className="h-4 w-4 text-emerald-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <span className="text-sm text-slate-700 group-hover:text-white transition-colors duration-300">
                    Advanced filtering and search options
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 group-hover:bg-white/20 flex items-center justify-center transition-colors duration-300">
                    <Target className="h-4 w-4 text-emerald-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <span className="text-sm text-slate-700 group-hover:text-white transition-colors duration-300">
                    LAS & VAS intelligent scoring system
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 group-hover:bg-white/20 flex items-center justify-center transition-colors duration-300">
                    <TrendingUp className="h-4 w-4 text-emerald-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <span className="text-sm text-slate-700 group-hover:text-white transition-colors duration-300">
                    Market trends and investment insights
                  </span>
                </div>
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg group-hover:bg-white group-hover:text-emerald-600 transition-all duration-300"
                onClick={onDiscoverLandParcel}
              >
                <span className="font-semibold">Browse Parcels</span>
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </div>
          </div>
        </div>

        {/* Feature Highlights with Enhanced Design */}
        <div className="bg-white rounded-3xl shadow-xl p-12 border border-slate-200">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">
              Why Choose Legacy Line?
            </h3>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Industry-leading technology meets comprehensive data analysis
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl hover:bg-slate-50 transition-colors duration-300 group">
              <div className="h-20 w-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <MapPin className="h-10 w-10 text-white" />
              </div>
              <h4 className="font-bold text-xl text-slate-900 mb-3">Precise Location Analysis</h4>
              <p className="text-slate-600 leading-relaxed">
                Military-grade GPS accuracy with real-time satellite mapping and coordinate verification
              </p>
            </div>
            
            <div className="text-center p-6 rounded-2xl hover:bg-slate-50 transition-colors duration-300 group">
              <div className="h-20 w-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Target className="h-10 w-10 text-white" />
              </div>
              <h4 className="font-bold text-xl text-slate-900 mb-3">Smart Scoring System</h4>
              <p className="text-slate-600 leading-relaxed">
                Advanced LAS & VAS algorithms delivering comprehensive investment evaluation metrics
              </p>
            </div>
            
            <div className="text-center p-6 rounded-2xl hover:bg-slate-50 transition-colors duration-300 group">
              <div className="h-20 w-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <h4 className="font-bold text-xl text-slate-900 mb-3">Market Intelligence</h4>
              <p className="text-slate-600 leading-relaxed">
                Real-time infrastructure data, development tracking, and predictive market analysis
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
            <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
            <div className="text-sm text-slate-600 font-medium">Parcels Analyzed</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl">
            <div className="text-4xl font-bold text-emerald-600 mb-2">95%</div>
            <div className="text-sm text-slate-600 font-medium">Accuracy Rate</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
            <div className="text-4xl font-bold text-purple-600 mb-2">24/7</div>
            <div className="text-sm text-slate-600 font-medium">Real-time Updates</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl">
            <div className="text-4xl font-bold text-orange-600 mb-2">50+</div>
            <div className="text-sm text-slate-600 font-medium">Data Sources</div>
          </div>
        </div>
      </div>
    </div>
  );
}