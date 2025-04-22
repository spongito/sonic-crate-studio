
import { useState } from "react";
import { ArrowRight, Sliders, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchDialog } from "@/components/Dashboard/AdvancedSearch/SearchDialog";
import { SignInDialog } from "@/components/auth/SignInDialog";
import { useAuth } from "@/context/AuthContext";
import { getDefaultPlatforms } from "@/components/Dashboard/MusicFinder/PlatformSelector";
import { usePlaylistGenerator } from "@/hooks/usePlaylistGenerator";

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
      <div className="glass-morphism p-3 sm:p-4 flex flex-col gap-4 rounded-lg">
        <Input
          placeholder="curate a soulful afrobeat set for golden hour"
          className="flex-1 bg-background/60 border-white/10 focus:border-gold/30 focus:ring-gold/20 rounded-md"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          disabled={isGenerating}
          spellCheck={false}
          autoComplete="off"
        />
        
        <div className="flex justify-center items-center mt-2">
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="border-white/10 hover:bg-white/5 px-5 py-2 md:px-6 md:py-2"
              onClick={() => setShowAdvancedSearch(true)}
              disabled={isGenerating}
            >
              <Sliders className="h-5 w-5" />
            </Button>
            <Button 
              className="bg-gold hover:bg-gold-dark text-black font-semibold px-5 py-2 md:px-6 md:py-2"
              onClick={handleSubmit}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Find Songs
                  {user && <ArrowRight className="ml-2 h-5 w-5" />}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-4 sm:mt-6 text-center">
        Free tier: 15 generations per month
      </p>

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
