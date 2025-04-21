
import { useState } from "react";
import Navbar from "@/components/Navbar";
import FeaturesSection from "@/components/LandingPage/FeaturesSection";
import HowItWorksSection from "@/components/LandingPage/HowItWorksSection";
import CTASection from "@/components/LandingPage/CTASection";
import Footer from "@/components/Footer";
import InlinePlaylistGenerator from "@/components/LandingPage/InlinePlaylistGenerator";
import PlaylistPromptPanel from "@/components/PlaylistPromptPanel";
import { SearchDialog } from "@/components/Dashboard/AdvancedSearch/SearchDialog";
import { getDefaultPlatforms } from "@/components/Dashboard/MusicFinder/PlatformSelector";

const defaultAdvancedParams = {
  genre: "",
  length: "1.5h",
  commercialFactor: 50,
  releaseYearRange: [1990, 2025],
  useBpmFilter: false,
  locations: ["global"],
  activeFilters: {
    genre: true,
    location: true,
    releaseYear: true,
    commercial: true,
    references: true,
    bpm: false,
  },
};

const Index = () => {
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [playlistData, setPlaylistData] = useState<any>(null);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // --- Advanced modal related state ---
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedParams, setAdvancedParams] = useState(defaultAdvancedParams);
  const [platforms, setPlatforms] = useState(getDefaultPlatforms());

  const handlePlaylistGenerated = (data: any) => {
    setPlaylistData(data);
    setShowPlaylist(true);
  };

  const handleAdvancedSubmit = (params: any) => {
    setShowAdvanced(false);
    setIsGenerating(true);

    // We'll mock the same way as before but now respecting new params
    setTimeout(() => {
      setIsGenerating(false);
      setAdvancedParams(params);
      setPrompt(params.prompt);
      // This should be replaced with actual playlist gen using the proper params/platforms.
      handlePlaylistGenerated({ tracks: [], params, platforms });
    }, 1200);
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
            onAdvanced={() => setShowAdvanced(true)}
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
      <SearchDialog
        open={showAdvanced}
        onOpenChange={setShowAdvanced}
        initialPrompt={prompt}
        onSubmit={handleAdvancedSubmit}
      />
    </div>
  );
};

export default Index;

