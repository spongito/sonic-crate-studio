
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import type { Track } from "@/types/table";
import { formatTracks } from "@/utils/formatTrack";
import { useNavigate } from "react-router-dom";

export const usePlaylistGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [playlistData, setPlaylistData] = useState<any>(null);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const { user, subscription, checkSubscription } = useAuth();
  const navigate = useNavigate();

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

      const formattedTracks = formatTracks(processedData.tracks);
      setPlaylistData({ ...processedData, tracks: formattedTracks });
      setShowPlaylist(true);
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
