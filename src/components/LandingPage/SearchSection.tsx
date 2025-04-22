
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
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

interface SearchSectionProps {
  onPlaylistGenerated: (data: any) => void;
  setShowPlaylist: (show: boolean) => void;
}

const SearchSection = ({ onPlaylistGenerated, setShowPlaylist }: SearchSectionProps) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedParams, setAdvancedParams] = useState(defaultAdvancedParams);
  const [platforms, setPlatforms] = useState(getDefaultPlatforms());
  const { user, subscription, checkSubscription } = useAuth();

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
            ...defaultAdvancedParams,
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
      
      if (user && subscription && !subscription.is_premium) {
        await supabase.functions.invoke('increment-playlist-count');
        await checkSubscription?.();
      }
      
      onPlaylistGenerated(processedData);
      toast.success("Playlist generated successfully!");
      
    } catch (error: any) {
      console.error("Generation error:", error);
      toast.error(error.message || "Failed to generate playlist");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAdvancedSubmit = (params: any) => {
    setShowAdvanced(false);
    setAdvancedParams(params);
    setPrompt(params.prompt);
    handleGenerate(params.prompt, params, platforms);
  };

  return (
    <div className="w-full">
      <div className="w-full px-4">
        <PlaylistPromptPanel
          prompt={prompt}
          setPrompt={setPrompt}
          isGenerating={isGenerating}
          onGenerate={() => handleGenerate(prompt)}
          onAdvanced={() => setShowAdvanced(true)}
        />
      </div>

      <SearchDialog
        open={showAdvanced}
        onOpenChange={setShowAdvanced}
        initialPrompt={prompt}
        onSubmit={handleAdvancedSubmit}
      />
    </div>
  );
};

export default SearchSection;
