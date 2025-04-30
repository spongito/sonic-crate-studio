
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import type { Track } from "@/types/table";
import { formatTracks } from "@/utils/formatTrack";
import { useNavigate } from "react-router-dom";
import { useTracks } from "@/context/TracksContext";

export const usePlaylistGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [playlistData, setPlaylistData] = useState<any>(null);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const { user, subscription, checkSubscription } = useAuth();
  const navigate = useNavigate();
  const { refreshTracks } = useTracks();

  const saveTracksToHistory = async (tracks: any[]) => {
    if (!user) return;

    try {
      const formattedTracksForHistory = tracks.map(track => ({
        user_id: user.id,
        track_id: track.id || track.spotify_id,
        title: track.title || track.name,
        artist: Array.isArray(track.artist) ? track.artist.join(", ") : track.artist,
        album: track.album,
        platform: track.platform || "spotify",
        key_signature: track.key_signature,
        genre: Array.isArray(track.genre) ? track.genre.join(", ") : track.genre,
        image_url: track.image_url || track.cover_url || track.image,
        external_url: track.platform_url || track.external_url,
        bpm: track.bpm || track.audio_features?.bpm,
        release_year: track.release_year
      }));

      const { error } = await supabase
        .from("user_track_history")
        .upsert(formattedTracksForHistory, {
          onConflict: 'user_id,track_id',
          ignoreDuplicates: false
        });

      if (error) {
        console.error("Error saving tracks to history:", error);
        throw error;
      }
    } catch (error) {
      console.error("Failed to save tracks to history:", error);
    }
  };

  const handleGenerate = async (prompt: string, advancedParams: any, platforms: any[]) => {
    if (!user) {
      toast.error("Please sign in to generate playlists");
      return;
    }
    
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }
    
    if (subscription?.remaining_generations === 0 && !subscription?.is_premium) {
      toast.info("This is a Premium feature. Upgrade to continue.");
      navigate("/dashboard");
      return;
    }
    
    try {
      setIsGenerating(true);
      setShowPlaylist(false);
      
      const enabledPlatforms = platforms.filter(p => p.enabled).map(p => p.id);
      
      const { data: processedData, error } = await supabase.functions.invoke('process-music-request', {
        body: { 
          prompt,
          advancedParams,
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
      
      if (!subscription?.is_premium) {
        await supabase.functions.invoke('increment-playlist-count');
        await checkSubscription();
      }

      // Save tracks to history
      await saveTracksToHistory(processedData.tracks);

      const formattedTracks = formatTracks(processedData.tracks);
      setPlaylistData({ ...processedData, tracks: formattedTracks });
      setShowPlaylist(true);
      
      // Refresh tracks in the library
      await refreshTracks();
      
      toast.success("Playlist generated successfully!");
      
    } catch (error: any) {
      console.error("Generation error:", error);
      toast.error(error.message || "Failed to generate playlist");
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    playlistData,
    showPlaylist,
    setShowPlaylist,
    handleGenerate,
  };
};
