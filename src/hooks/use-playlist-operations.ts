
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
      
      // Get the current date and time formatted
      const dateTimeStr = format(new Date(), "MMM d - h:mm a");
      
      // Create a name based on the search query
      const queryText = playlistData.intent?.original_prompt || "";
      
      // Use name from backend if available, otherwise create one
      let name = playlistData.name || "";
      
      // If no name is provided or if we want to ensure the query is part of the name
      if (!name || !name.includes(queryText.substring(0, 10))) {
        // Truncate the query if it's too long
        const truncatedQuery = queryText.length > 40 ? 
          queryText.substring(0, 37) + "..." : queryText;
        
        // Create a name with the query and date/time
        name = truncatedQuery ? 
          `${truncatedQuery} - ${dateTimeStr}` : 
          format(new Date(), "MMM d - h:mm a");  // Fallback to just date if no query
      }
      
      // Ensure all tracks have the required metadata fields
      const processedTracks = playlistData.tracks.map((track: any) => ({
        ...track,
        // Normalize field names
        title: track.title || track.name || "Unknown Track",
        artist: track.artist || "Unknown Artist",
        album: track.album || "Unknown Album",
        spotify_id: track.spotify_id || track.id,
        match_score: track.match_score || track.score || 100,
        platform: track.platform || "spotify",
        platform_url: track.external_url || track.platform_url || `https://open.spotify.com/track/${(track.spotify_id || '').split(':').pop()}`,
        cover_url: track.image || track.cover_url || "",
        // Preserve audio features if present
        audio_features: track.audio_features || {
          bpm: undefined,
          key: undefined,
          mode: undefined
        }
      }));
      
      const { error } = await supabase.from("playlists").insert({
        name,
        user_id: user.id,
        prompt: playlistData.intent?.original_prompt || "",
        description: playlistData.intent?.description || "",
        results: processedTracks,
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
