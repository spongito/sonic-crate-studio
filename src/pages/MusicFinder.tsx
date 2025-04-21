import { useState } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import PlaylistViewer from "@/components/Dashboard/PlaylistViewer";
import { AdvancedSettings, type AdvancedSettingsParams } from "@/components/Dashboard/MusicFinder/AdvancedSettings";
import { SearchPromptInput } from "@/components/Dashboard/MusicFinder/SearchPromptInput";
import { DebugPanel } from "@/components/Dashboard/MusicFinder/DebugPanel";
import { getDefaultPlatforms, type Platform } from "@/components/Dashboard/MusicFinder/PlatformSelector";
import { usePlaylistGeneration } from "@/hooks/use-playlist-generation";
import { useAuth } from "@/context/AuthContext";
import PromptBar from "@/components/PromptBar";
import { SearchDialog } from "@/components/Dashboard/AdvancedSearch/SearchDialog";

const MusicFinder = () => {
  const [prompt, setPrompt] = useState("");
  const [showDebug, setShowDebug] = useState(false);
  const { subscription } = useAuth();
  const [platforms, setPlatforms] = useState(getDefaultPlatforms());
  
  const [advancedParams, setAdvancedParams] = useState<AdvancedSettingsParams>({
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
  });

  const {
    isGenerating,
    playlistData,
    showPlaylist,
    debugLogs,
    handleGenerate
  } = usePlaylistGeneration();

  const handleReset = () => {
    setAdvancedParams({
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
    });
    setPlatforms(getDefaultPlatforms());
    setPrompt("");
  };

  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <DashboardLayout>
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
                disabled={!subscription?.is_premium && subscription?.remaining_generations === 0}
                onGenerate={() => handleGenerate(prompt, advancedParams, platforms)}
                onAdvanced={() => setShowAdvanced(true)}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Free tier: 15 generations per month
              </p>
            </div>
          </div>
          {showPlaylist && (
            <div className="mt-8 animate-fade-in w-full">
              <PlaylistViewer playlistData={playlistData} />
            </div>
          )}
          <DebugPanel 
            showDebug={showDebug}
            onToggleDebug={setShowDebug}
            debugLogs={debugLogs}
          />
        </div>
      </div>
      <SearchDialog
        open={showAdvanced}
        onOpenChange={setShowAdvanced}
        initialPrompt={prompt}
        onSubmit={(params) => {
          setShowAdvanced(false);
          handleGenerate(
            params.prompt,
            params,
            platforms,
          );
        }}
      />
    </DashboardLayout>
  );
};

export default MusicFinder;
