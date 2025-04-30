
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import FeaturesSection from "@/components/LandingPage/FeaturesSection";
import HowItWorksSection from "@/components/LandingPage/HowItWorksSection";
import CTASection from "@/components/LandingPage/CTASection";
import Footer from "@/components/Footer";
import SearchSection from "@/components/LandingPage/SearchSection";
import ResultsSection from "@/components/LandingPage/ResultsSection";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";

const Index = () => {
  const { user } = useAuth();
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [playlistData, setPlaylistData] = useState<any>(null);

  const handlePlaylistGenerated = (data: any) => {
    setPlaylistData(data);
    setShowPlaylist(true);
  };

  // For unauthenticated users, show the landing page
  if (!user) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="relative min-h-screen flex items-center justify-center">
          <div className="z-10 flex flex-col w-full max-w-5xl mx-auto items-center pt-24 pb-8">
            <h1 className="text-gradient text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-center mb-5">
              Sound Designed by You
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-center mb-8">
              Describe your playlist idea. Let our AI do the digging.
            </p>

            <SearchSection
              onPlaylistGenerated={handlePlaylistGenerated}
              setShowPlaylist={setShowPlaylist}
            />

            <ResultsSection
              showPlaylist={showPlaylist}
              playlistData={playlistData}
            />
          </div>
        </div>
        <FeaturesSection />
        <HowItWorksSection />
        <CTASection />
        <Footer />
      </div>
    );
  }

  // For authenticated users, use the DashboardLayout for consistent navigation
  return (
    <DashboardLayout>
      <div className="relative min-h-screen">
        <div className="z-10 flex flex-col w-full max-w-5xl mx-auto items-center py-8">
          <h1 className="text-gradient text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-center mb-5">
            Sound Designed by You
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-center mb-8">
            Describe your playlist idea. Let our AI do the digging.
          </p>

          <SearchSection
            onPlaylistGenerated={handlePlaylistGenerated}
            setShowPlaylist={setShowPlaylist}
          />

          <ResultsSection
            showPlaylist={showPlaylist}
            playlistData={playlistData}
          />
        </div>
      </div>
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
    </DashboardLayout>
  );
};

export default Index;
