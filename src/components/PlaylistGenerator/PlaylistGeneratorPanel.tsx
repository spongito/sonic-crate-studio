
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, ChevronDown, ChevronUp, Bug } from "lucide-react";
import { SearchPromptInput } from "./SearchPromptInput";
import { AdvancedSettings, type AdvancedSettingsParams } from "./AdvancedSettings";
import { DebugPanel } from "./DebugPanel";
import { getDefaultPlatforms, type Platform } from "./PlatformSelector";
import { usePlaylistGeneration } from "@/hooks/use-playlist-generation";
import { useAuth } from "@/context/AuthContext";
import PlaylistViewer from "@/components/Dashboard/PlaylistViewer";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface PlaylistGeneratorPanelProps {
  isHomepage?: boolean;
  onPlaylistGenerated?: (data: any) => void;
}

export function PlaylistGeneratorPanel({ 
  isHomepage = false,
  onPlaylistGenerated 
}: PlaylistGeneratorPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [showDebug, setShowDebug] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { subscription, user } = useAuth();
  const [platforms, setPlatforms] = useState(getDefaultPlatforms());
  
  const [advancedParams, setAdvancedParams] = useState<AdvancedSettingsParams>({
    genre: "",
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
  });

  const {
    isGenerating,
    playlistData,
    showPlaylist,
    debugLogs,
    debugQueryContext,
    handleGenerate
  } = usePlaylistGeneration();

  const handleReset = () => {
    setAdvancedParams({
      genre: "",
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
    });
    setPlatforms(getDefaultPlatforms());
    setPrompt("");
  };

  const handlePromptSubmit = async () => {
    await handleGenerate(prompt, advancedParams, platforms);
    
    if (onPlaylistGenerated && playlistData) {
      onPlaylistGenerated(playlistData);
    }
  };

  const isDisabled = !subscription?.is_premium && subscription?.remaining_generations === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6">
        <div className="flex-1 space-y-6">
          {!isHomepage && (
            <>
              <h1 className="text-4xl font-bold bg-gradient-to-br from-white via-white/90 to-white/70 bg-clip-text text-transparent">
                Music Finder
              </h1>
              <p className="text-white/60">
                Describe the mood, genre, or occasion and let our AI create the perfect playlist for you.
              </p>
            </>
          )}
          
          <div className="glass-morphism p-4 space-y-6 rounded-xl">
            <SearchPromptInput 
              prompt={prompt}
              isGenerating={isGenerating}
              disabled={isDisabled || (!user && isHomepage)}
              onChange={setPrompt}
              onGenerate={handlePromptSubmit}
            />
            
            <div className="flex items-center justify-between">
              <div className="text-xl font-semibold text-gradient">
                Dial In Your Playlist
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="text-xs flex items-center gap-1"
              >
                {expanded ? (
                  <>
                    Hide Options
                    <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Show All Options
                    <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>

            <Collapsible open={expanded} onOpenChange={setExpanded}>
              <CollapsibleContent>
                <div className="space-y-6 animate-fade-in py-2">
                  <AdvancedSettings
                    params={advancedParams}
                    onChange={setAdvancedParams}
                    platforms={platforms}
                    onPlatformsChange={setPlatforms}
                    onReset={handleReset}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
            
            {user && (
              <div className="flex justify-end">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDebug(!showDebug)}
                  className="flex items-center gap-1"
                >
                  <Bug className="h-4 w-4" />
                  {showDebug ? "Hide" : "Show"} Debug Info
                </Button>
              </div>
            )}
          </div>
          
          {showPlaylist && !isHomepage && (
            <div className="mt-8 animate-fade-in">
              <PlaylistViewer playlistData={playlistData} />
            </div>
          )}
          
          {user && (
            <DebugPanel 
              showDebug={showDebug}
              onToggleDebug={setShowDebug}
              debugLogs={debugLogs}
              debugQueryContext={debugQueryContext}
            />
          )}
        </div>
      </div>
    </div>
  );
}
