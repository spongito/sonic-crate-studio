
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
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  const { user, subscription, checkSubscription } = useAuth();

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
    setAdvancedParams(params);
    setPrompt(params.prompt);
    handleGenerate(params.prompt, params, platforms);
  };
  
  const handleGenerate = async (promptText: string, params = advancedParams, selectedPlatforms = platforms) => {
    if (!promptText.trim()) {
      toast.error("Please enter a prompt");
      return;
    }
    
    setIsGenerating(true);
    setShowPlaylist(false);
    
    try {
      const enabledPlatforms = selectedPlatforms.filter(p => p.enabled).map(p => p.id);
      
      const { data: processedData, error } = await supabase.functions.invoke('process-music-request', {
        body: { 
          prompt: promptText,
          advancedParams: {
            // Basic default params
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
            // Override with any custom params
            ...params
          },
          platforms: enabledPlatforms
        }
      });
      
      if (error) throw error;
      
      if (processedData && processedData.error) {
        throw new Error(processedData.error);
      }
      
      if (!processedData || !processedData.tracks) {
        throw new Error("Failed to generate playlist data");
      }
      
      // If user is logged in and not premium, increment count
      if (user && subscription && !subscription.is_premium) {
        await supabase.functions.invoke('increment-playlist-count');
        await checkSubscription?.();
      }
      
      handlePlaylistGenerated(processedData);
      toast.success("Playlist generated successfully!");
      
    } catch (error: any) {
      console.error("Generation error:", error);
      toast.error(error.message || "Failed to generate playlist");
    } finally {
      setIsGenerating(false);
    }
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
            onGenerate={() => handleGenerate(prompt)}
            onAdvanced={() => setShowAdvanced(true)}
          />

          {showPlaylist && playlistData && (
            <InlinePlaylistGenerator
              playlistData={playlistData}
              className="max-w-7xl mx-auto px-4 py-12 w-full"
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
