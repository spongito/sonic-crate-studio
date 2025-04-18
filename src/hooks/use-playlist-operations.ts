
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";

export const usePlaylistOperations = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();

  const savePlaylist = async (playlistData: any, isPublic: boolean = false) => {
    if (!user) {
      toast.error("You must be logged in to save playlists");
      return;
    }

    try {
      setIsSaving(true);
      const name = format(new Date(), "MMM d - h:mm a");
      
      const { error } = await supabase.from("playlists").insert({
        name,
        user_id: user.id,
        prompt: playlistData.intent?.original_prompt || "",
        description: playlistData.intent?.description || "",
        results: playlistData.tracks || [],
        genres: playlistData.intent?.genre ? [playlistData.intent.genre] : [],
        settings: {
          ...playlistData.intent,
          mode: playlistData.intent?.style || "club-ready"
        },
        is_public: isPublic
      });

      if (error) throw error;
      
      toast.success(
        isPublic 
          ? "Playlist saved and shared to community!" 
          : "Playlist saved successfully!"
      );
    } catch (error) {
      console.error("Error saving playlist:", error);
      toast.error("Failed to save playlist");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    savePlaylist,
    isSaving
  };
};
