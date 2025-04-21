
import { useState } from "react";
import Navbar from "@/components/Navbar";
import FeaturesSection from "@/components/LandingPage/FeaturesSection";
import HowItWorksSection from "@/components/LandingPage/HowItWorksSection";
import CTASection from "@/components/LandingPage/CTASection";
import Footer from "@/components/Footer";
import InlinePlaylistGenerator from "@/components/LandingPage/InlinePlaylistGenerator";
import PlaylistPromptPanel from "@/components/PlaylistPromptPanel";

const Index = () => {
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [playlistData, setPlaylistData] = useState<any>(null);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePlaylistGenerated = (data: any) => {
    setPlaylistData(data);
    setShowPlaylist(true);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="z-10 flex flex-col w-full max-w-3xl mx-auto items-center pt-24 pb-8">
          <h1 className="text-gradient text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-center mb-5">
            Sound Designed by You
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-center mb-8">
            Describe your playlist idea. Let our AI do the digging.
          </p>

          <PlaylistPromptPanel
            prompt={prompt}
            setPrompt={setPrompt}
            isGenerating={isGenerating}
            onGenerate={() => {
              setIsGenerating(true);
              setTimeout(() => {
                setIsGenerating(false);
                handlePlaylistGenerated({ tracks: [] });
              }, 1200);
            }}
          />

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
