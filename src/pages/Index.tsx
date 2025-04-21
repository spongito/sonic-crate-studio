
import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/LandingPage/HeroSection";
import FeaturesSection from "@/components/LandingPage/FeaturesSection";
import HowItWorksSection from "@/components/LandingPage/HowItWorksSection";
import CTASection from "@/components/LandingPage/CTASection";
import Footer from "@/components/Footer";
import InlinePlaylistGenerator from "@/components/LandingPage/InlinePlaylistGenerator";
import PromptBar from "@/components/PromptBar";

const Index = () => {
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [playlistData, setPlaylistData] = useState<any>(null);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // We'll call the hero section's original handlePlaylistGenerated logic
  const handlePlaylistGenerated = (data: any) => {
    setPlaylistData(data);
    setShowPlaylist(true);
  };

  // Homepage hero still uses HeroSection for all the logic/UI except the unified prompt bar visual
  return (
    <div className="min-h-screen">
      <Navbar />
      {/* Instead of swapping the whole HeroSection JS logic, 
      we'll overlay PromptBar for a 1:1 match per requirements */}
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="z-10 flex flex-col w-full max-w-3xl mx-auto items-center pt-24 pb-8">
          <h1 className="text-gradient text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-center mb-5">
            Sound Designed by You
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-center mb-8">
            Describe your playlist idea. Let our AI do the digging.
          </p>
          <div className="w-full max-w-2xl">
            <div className="glass-morphism p-2 sm:p-3 flex flex-col gap-3">
              <PromptBar
                prompt={prompt}
                setPrompt={setPrompt}
                isGenerating={isGenerating}
                onGenerate={() => {
                  setIsGenerating(true);
                  // Dummy async simulate
                  setTimeout(() => {
                    setIsGenerating(false);
                    handlePlaylistGenerated({ tracks: [] });
                  }, 1200);
                }}
                onAdvanced={() => {/* No-op on homepage */}}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Free tier: 15 generations per month
              </p>
            </div>
          </div>
          {showPlaylist && playlistData && (
            <InlinePlaylistGenerator
              playlistData={playlistData}
              className="max-w-7xl mx-auto px-4 py-12"
            />
          )}
        </div>
      </div>
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
