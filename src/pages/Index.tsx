import { useState } from "react";
import Navbar from "@/components/Navbar";
import FeaturesSection from "@/components/LandingPage/FeaturesSection";
import HowItWorksSection from "@/components/LandingPage/HowItWorksSection";
import CTASection from "@/components/LandingPage/CTASection";
import Footer from "@/components/Footer";
import { GeneratedTrack } from "@/components/GeneratedPlaylistTable";
import PlaylistPromptPanel from "@/components/PlaylistPromptPanel";
import { SearchDialog } from "@/components/Dashboard/AdvancedSearch/SearchDialog";
import { getDefaultPlatforms } from "@/components/Dashboard/MusicFinder/PlatformSelector";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import TabPlaylistView from "@/components/TabPlaylistView";

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
      
      handlePlaylistGenerated(processedData);
      toast.success("Playlist generated successfully!");
      
    } catch (error: any) {
      console.error("Generation error:", error);
      toast.error(error.message || "Failed to generate playlist");
    } finally {
      setIsGenerating(false);
    }
  };

  const formattedTracks: GeneratedTrack[] = (playlistData?.tracks || []).map((track: any) => ({
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
    platform_url: track.platform_url || track.external_url,
  }));

  const handleAddToLibrary = (trackId: string) => {
    if (!user) {
      toast.error("Please sign in to add tracks to your library");
      return;
    }
    toast.success("Track added to your library");
  };
  
  const handleSavePlaylist = (platform: string) => {
    if (!user) {
      toast.error("Please sign in to save playlists");
      return;
    }
    toast.success(`Playlist saved to your ${platform} account`);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="z-10 flex flex-col w-full max-w-5xl mx-auto items-center pt-24 pb-8">
          <h1 className="text-gradient text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-center mb-5">
            Sound Designed by You
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-center mb-8">
            Describe your playlist idea. Let our AI do the digging.
          </p>

          <div className="w-full px-4">
            <PlaylistPromptPanel
              prompt={prompt}
              setPrompt={setPrompt}
              isGenerating={isGenerating}
              onGenerate={() => handleGenerate(prompt)}
              onAdvanced={() => setShowAdvanced(true)}
            />
          </div>

          {showPlaylist && playlistData && (
            <div className="w-full px-4 md:px-8 lg:px-12 py-8 mt-6">
              <TabPlaylistView
                tracks={formattedTracks}
                userLikedTrackIds={[]}
                onLikeChange={(trackId, liked) => {
                  if (!user) {
                    toast.error("Please sign in to like tracks");
                    return;
                  }
                  toast.success(liked ? "Added to your liked tracks" : "Removed from your liked tracks");
                }}
                onAddToLibrary={handleAddToLibrary}
                onSavePlaylist={handleSavePlaylist}
                playlistName={playlistData.name || "Generated Playlist"}
                className="mt-6"
              />
            </div>
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
