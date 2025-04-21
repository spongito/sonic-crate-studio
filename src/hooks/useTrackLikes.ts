
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export function useTrackLikes() {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState<Record<string, boolean>>({});

  const toggleLike = async (trackId: string, currentlyLiked: boolean) => {
    if (!user) {
      toast.error("Please sign in to like tracks");
      return false;
    }

    setIsProcessing(prev => ({ ...prev, [trackId]: true }));
    
    try {
      if (currentlyLiked) {
        // Unlike: Remove from liked_tracks table
        const { error } = await supabase
          .from("liked_tracks")
          .delete()
          .eq("user_id", user.id)
          .eq("track_id", trackId);

        if (error) throw error;
        toast.success("Track removed from your likes");
      } else {
        // Like: Add to liked_tracks table
        const { error } = await supabase
          .from("liked_tracks")
          .insert({ user_id: user.id, track_id: trackId });

        if (error) throw error;
        toast.success("Track added to your likes");
      }
      
      return !currentlyLiked; // Return the new like state
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update track like status");
      return currentlyLiked; // Return the original state on error
    } finally {
      setIsProcessing(prev => ({ ...prev, [trackId]: false }));
    }
  };

  const addToLibrary = async (trackId: string) => {
    if (!user) {
      toast.error("Please sign in to add tracks to your library");
      return;
    }

    toast.success("Track added to your library");
    // Logic for adding to library could be implemented here
  };

  return {
    toggleLike,
    addToLibrary,
    isProcessing
  };
}
