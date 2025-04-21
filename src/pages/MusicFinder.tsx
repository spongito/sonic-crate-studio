import { useState } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import PlaylistViewer from "@/components/Dashboard/PlaylistViewer";
import { AdvancedSettings, type AdvancedSettingsParams } from "@/components/Dashboard/MusicFinder/AdvancedSettings";
import { usePlaylistGeneration } from "@/hooks/use-playlist-generation";
import { useAuth } from "@/context/AuthContext";
import PlaylistPromptPanel from "@/components/PlaylistPromptPanel";
import { SearchDialog } from "@/components/Dashboard/AdvancedSearch/SearchDialog";
import { getDefaultPlatforms } from "@/components/Dashboard/MusicFinder/PlatformSelector";

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
      bpm: false,
    },
  });

  const {
    isGenerating,
    playlistData,
    showPlaylist,
    debugLogs,
    handleGenerate,
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
        bpm: false,
      },
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

          <PlaylistPromptPanel
            prompt={prompt}
            setPrompt={setPrompt}
            isGenerating={isGenerating}
            disabled={!subscription?.is_premium && subscription?.remaining_generations === 0}
            onGenerate={() => handleGenerate(prompt, advancedParams, platforms)}
            onAdvanced={() => setShowAdvanced(true)}
          />

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
          handleGenerate(params.prompt, params, platforms);
        }}
      />
    </DashboardLayout>
  );
};

export default MusicFinder;
