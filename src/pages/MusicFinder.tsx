
import { useState } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { AdvancedSettings, type AdvancedSettingsParams } from "@/components/Dashboard/MusicFinder/AdvancedSettings";
import { usePlaylistGeneration } from "@/hooks/use-playlist-generation";
import { useAuth } from "@/context/AuthContext";
import PlaylistPromptPanel from "@/components/PlaylistPromptPanel";
import { SearchDialog } from "@/components/Dashboard/AdvancedSearch/SearchDialog";
import { getDefaultPlatforms } from "@/components/Dashboard/MusicFinder/PlatformSelector";
import { DebugPanel } from "@/components/Dashboard/MusicFinder/DebugPanel";
import { GeneratedPlaylistTable, type GeneratedTrack } from "@/components/GeneratedPlaylistTable";
import { useUserLikedTracks } from "@/hooks/useUserLikedTracks";

const MusicFinder = () => {
  const [prompt, setPrompt] = useState("");
  const [showDebug, setShowDebug] = useState(false);
  const { user, subscription } = useAuth();
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

  const { tracks: likedTracks } = useUserLikedTracks({
    filters: {
      search: "",
      bpmMin: "",
      bpmMax: "",
      yearMin: "",
      yearMax: "",
      genre: [],
      key: "",
      energy: [],
      mood: [],
      camelotMode: false
    },
    userId: user?.id || ""
  });

  const likedTrackIds = (Array.isArray(likedTracks) ? likedTracks : []).map(t => t.id);

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

  const formattedTracks: GeneratedTrack[] = playlistData?.tracks?.map((track: any) => ({
    id: track.id || track.spotify_id || `track-${Math.random()}`,
    title: track.title || track.name || "Unknown Track",
    artist: Array.isArray(track.artist) ? track.artist : [track.artist || "Unknown Artist"],
    album: track.album || "Unknown Album",
    platform: track.platform || "spotify",
    image_url: track.image_url || track.cover_url || track.image,
    bpm: track.bpm || track.audio_features?.bpm,
    key_signature: track.key_signature || (track.audio_features ? `${track.audio_features.key} ${track.audio_features.mode === 1 ? 'Major' : 'Minor'}` : null),
    genre: Array.isArray(track.genre) ? track.genre : track.genre ? [track.genre] : null,
    release_year: track.release_year,
    duration: track.duration,
  })) || [];

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleLikeChange = (trackId: string, liked: boolean) => {
    // Refresh liked tracks if needed - handled by the component itself
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen flex flex-col">
        <div className="flex flex-col w-full items-center pt-16 pb-8">
          <h1 className="text-gradient text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-center mb-5">
            Sound Designed by You
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-center mb-8">
            Describe your playlist idea. Let our AI do the digging.
          </p>

          <div className="w-full max-w-3xl mx-auto px-4">
            <PlaylistPromptPanel
              prompt={prompt}
              setPrompt={setPrompt}
              isGenerating={isGenerating}
              disabled={!subscription?.is_premium && subscription?.remaining_generations === 0}
              onGenerate={() => handleGenerate(prompt, advancedParams, platforms)}
              onAdvanced={() => setShowAdvanced(true)}
            />
          </div>

          {showPlaylist && formattedTracks.length > 0 && (
            <div className="mt-8 animate-fade-in w-full px-4 md:px-8 lg:px-12">
              <GeneratedPlaylistTable 
                tracks={formattedTracks}
                userLikedTrackIds={likedTrackIds} 
                onLikeChange={handleLikeChange}
                playlistName={playlistData?.name || "Generated Playlist"}
                fullWidth={true}
              />
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
