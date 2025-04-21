
import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/LandingPage/HeroSection";
import FeaturesSection from "@/components/LandingPage/FeaturesSection";
import HowItWorksSection from "@/components/LandingPage/HowItWorksSection";
import CTASection from "@/components/LandingPage/CTASection";
import Footer from "@/components/Footer";
import InlinePlaylistGenerator from "@/components/LandingPage/InlinePlaylistGenerator";

const Index = () => {
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [playlistData, setPlaylistData] = useState<any>(null);
  
  const handlePlaylistGenerated = (data: any) => {
    setPlaylistData(data);
    setShowPlaylist(true);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection 
        onPlaylistGenerated={handlePlaylistGenerated}
        setShowPlaylist={setShowPlaylist}
      />
      
      {showPlaylist && playlistData && (
        <InlinePlaylistGenerator 
          playlistData={playlistData} 
          className="max-w-7xl mx-auto px-4 py-12"
        />
      )}
      
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
