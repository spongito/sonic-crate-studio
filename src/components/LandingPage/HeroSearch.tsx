
import { useState } from "react";
import { SearchDialog } from "@/components/Dashboard/AdvancedSearch/SearchDialog";
import { SignInDialog } from "@/components/auth/SignInDialog";
import { useAuth } from "@/context/AuthContext";
import { getDefaultPlatforms } from "@/components/Dashboard/MusicFinder/PlatformSelector";
import { usePlaylistGenerator } from "@/hooks/usePlaylistGenerator";
import { SearchForm } from "./HeroSearch/SearchForm";
import { GenerationLimit } from "./HeroSearch/GenerationLimit";

interface HeroSearchProps {
  onPlaylistGenerated?: (data: any) => void;
  setShowPlaylist?: (show: boolean) => void;
}

const HeroSearch = ({ onPlaylistGenerated, setShowPlaylist }: HeroSearchProps) => {
  const [prompt, setPrompt] = useState("");
  const [platforms] = useState(getDefaultPlatforms());
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const { user, subscription } = useAuth();
  
  const { 
    isGenerating, 
    playlistData, 
    handleGenerate 
  } = usePlaylistGenerator();

  const handleSubmit = async () => {
    if (!user) {
      setShowSignIn(true);
      return;
    }
    
    await handleGenerate(prompt, {
      mode: "club-ready",
      description: "",
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
        bpm: false
      }
    }, platforms);

    if (onPlaylistGenerated && playlistData) {
      onPlaylistGenerated(playlistData);
    }
  };

  const handleAdvancedSearchSubmit = async (params: any) => {
    if (!user) {
      setShowSignIn(true);
      return;
    }
    
    await handleGenerate(params.prompt, params, platforms);

    if (onPlaylistGenerated && playlistData) {
      onPlaylistGenerated(playlistData);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full mt-10 px-0 sm:px-3">
      <SearchForm
        prompt={prompt}
        setPrompt={setPrompt}
        handleSubmit={handleSubmit}
        isGenerating={isGenerating}
        onAdvancedClick={() => setShowAdvancedSearch(true)}
        user={user}
      />
      
      <GenerationLimit subscription={subscription} />

      <SearchDialog
        open={showAdvancedSearch}
        onOpenChange={setShowAdvancedSearch}
        initialPrompt={prompt}
        onSubmit={handleAdvancedSearchSubmit}
      />

      <SignInDialog 
        open={showSignIn} 
        onOpenChange={setShowSignIn}
      />
    </div>
  );
};

export default HeroSearch;
