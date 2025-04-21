
import { useState } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import PlaylistViewer from "@/components/Dashboard/PlaylistViewer";
import { AdvancedSettings, type AdvancedSettingsParams } from "@/components/Dashboard/MusicFinder/AdvancedSettings";
import { SearchPromptInput } from "@/components/Dashboard/MusicFinder/SearchPromptInput";
import { DebugPanel } from "@/components/Dashboard/MusicFinder/DebugPanel";
import { getDefaultPlatforms, type Platform } from "@/components/Dashboard/MusicFinder/PlatformSelector";
import { usePlaylistGeneration } from "@/hooks/use-playlist-generation";
import { useAuth } from "@/context/AuthContext";

const MusicFinder = () => {
  const [prompt, setPrompt] = useState("");
  const [showDebug, setShowDebug] = useState(false);
  const { subscription } = useAuth();
  const [platforms, setPlatforms] = useState(getDefaultPlatforms());
  
  const [advancedParams, setAdvancedParams] = useState<AdvancedSettingsParams>({
    mode: "club-ready",
    description: "",
    genre: "",
    length: "1.5h",
    commercialFactor: 50,
    releaseYearRange: [1990, 2025],
    useBpmFilter: false,
    locations: ["global"]
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
      mode: "club-ready",
      description: "",
      genre: "",
      length: "1.5h",
      commercialFactor: 50,
      releaseYearRange: [1990, 2025],
      useBpmFilter: false,
      locations: ["global"]
    });
    setPlatforms(getDefaultPlatforms());
    setPrompt("");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col gap-6">
          <div className="flex-1 space-y-6">
            <h1 className="text-4xl font-bold bg-gradient-to-br from-white via-white/90 to-white/70 bg-clip-text text-transparent">
              Music Finder
            </h1>
            <p className="text-white/60">
              Describe the mood, genre, or occasion and let our AI create the perfect playlist for you.
            </p>
            
            <div className="glass-morphism p-4 space-y-6 rounded-xl">
              <SearchPromptInput 
                prompt={prompt}
                isGenerating={isGenerating}
                disabled={!subscription?.is_premium && subscription?.remaining_generations === 0}
                onChange={setPrompt}
                onGenerate={() => handleGenerate(prompt, advancedParams, platforms)}
              />
              
              <AdvancedSettings
                params={advancedParams}
                onChange={setAdvancedParams}
                platforms={platforms}
                onPlatformsChange={setPlatforms}
                onReset={handleReset}
              />
            </div>
            
            {showPlaylist && (
              <div className="mt-8 animate-fade-in">
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
      </div>
    </DashboardLayout>
  );
};

export default MusicFinder;
