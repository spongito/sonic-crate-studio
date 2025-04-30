
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updatePlaylist, deletePlaylist } from '@/services/PlaylistService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useTracks } from '@/context/TracksContext';
import type { Playlist } from '@/components/Playlists/types';
import { toast } from 'sonner';

export const usePlaylistOperations = (playlist: Playlist | null = null, id?: string) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { refreshTracks } = useTracks();

  const saveTracksToHistory = async (tracks: any[]) => {
    if (!user || !tracks || tracks.length === 0) {
      console.log('Cannot save tracks: No user logged in or no tracks provided');
      return;
    }

    try {
      console.log(`Saving ${tracks.length} tracks to history for user ${user.id}`);
      
      const formattedTracksForHistory = tracks.map(track => ({
        user_id: user.id,
        track_id: track.id || track.spotify_id || `${track.name}-${track.artist}`,
        title: track.title || track.name || "Unknown Track",
        artist: Array.isArray(track.artist) ? track.artist.join(", ") : track.artist || "Unknown Artist",
        album: track.album || "Unknown Album",
        platform: track.platform || "spotify",
        key_signature: track.key_signature || (track.audio_features ? `${track.audio_features.key} ${track.audio_features.mode === 1 ? 'Major' : 'Minor'}` : null),
        genre: Array.isArray(track.genre) ? track.genre.join(", ") : track.genre || "",
        image_url: track.image_url || track.cover_url || track.image || "",
        external_url: track.external_url || track.platform_url || "",
        bpm: track.bpm || track.audio_features?.bpm || track.audio_features?.tempo,
        release_year: track.release_year
      }));

      // Break into smaller batches of 50 to avoid large payloads
      const batchSize = 50;
      let totalSuccessful = 0;

      for (let i = 0; i < formattedTracksForHistory.length; i += batchSize) {
        const batch = formattedTracksForHistory.slice(i, i + batchSize);
        
        console.log(`Processing batch ${i/batchSize + 1} of ${Math.ceil(formattedTracksForHistory.length/batchSize)} (${batch.length} tracks)`);
        
        const { data, error } = await supabase
          .from("user_track_history")
          .upsert(batch, {
            onConflict: 'user_id,track_id',
            ignoreDuplicates: false
          });

        if (error) {
          console.error("Error saving tracks batch to history:", error);
          console.error("First track in failed batch:", batch[0]);
          // Continue with next batch despite errors
        } else {
          totalSuccessful += batch.length;
        }
      }
      
      console.log(`Successfully saved ${totalSuccessful} of ${tracks.length} tracks to history`);
      return totalSuccessful;
    } catch (error) {
      console.error("Failed to save tracks to history:", error);
      return 0;
    }
  };

  const handleDelete = async () => {
    if (!id || !playlist) return;
    
    const success = await deletePlaylist(id);
    if (success) {
      navigate('/playlists');
    }
  };

  const updatePlaylistData = async (name: string, coverUrl: string) => {
    if (!id || !playlist) return false;
    
    const success = await updatePlaylist(id, {
      name: name,
      cover_image_url: coverUrl
    });
    
    if (success) {
      // If we're updating a playlist, ensure its tracks are in the history
      if (playlist.results && Array.isArray(playlist.results)) {
        await saveTracksToHistory(playlist.results);
        await refreshTracks();
      }
      return true;
    }
    
    return false;
  };

  const savePlaylist = async (playlistData: any, isPublic: boolean = false) => {
    if (!user) {
      toast.error("Please sign in to save playlists");
      return false;
    }

    setIsSaving(true);

    try {
      // Format playlist data for storage
      const playlistToSave = {
        name: playlistData.name || "Generated Playlist",
        user_id: user.id,
        results: playlistData.tracks || [],
        cover_image_url: playlistData.cover_image_url || "",
        is_public: isPublic,
        description: playlistData.description || "",
        prompt: playlistData.prompt || "",
        settings: playlistData.settings || {},
        tags: playlistData.tags || [],
        genres: playlistData.genres || []
      };

      // Save playlist to database
      const { data, error } = await supabase
        .from("playlists")
        .insert(playlistToSave)
        .select("id")
        .single();

      if (error) {
        console.error("Error saving playlist:", error);
        toast.error("Failed to save playlist");
        return false;
      }

      // Save tracks to user history
      if (playlistData.tracks && Array.isArray(playlistData.tracks) && playlistData.tracks.length > 0) {
        const savedCount = await saveTracksToHistory(playlistData.tracks);
        if (savedCount > 0) {
          await refreshTracks();
          console.log(`Added ${savedCount} tracks to library from playlist`);
        }
      }

      toast.success("Playlist saved successfully!");
      return true;
    } catch (error) {
      console.error("Error in save playlist:", error);
      toast.error("Something went wrong while saving");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isEditing,
    setIsEditing,
    handleDelete,
    updatePlaylistData,
    savePlaylist,
    isSaving,
    saveTracksToHistory // Expose the function so it can be used elsewhere
  };
};
