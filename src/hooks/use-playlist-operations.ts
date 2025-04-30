
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updatePlaylist, deletePlaylist } from '@/services/PlaylistService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useTracks } from '@/context/TracksContext';
import type { Playlist } from '@/components/Playlists/types';
import { toast } from 'sonner';
import { useLogger } from '@/hooks/useLogger';

export const usePlaylistOperations = (playlist: Playlist | null = null, id?: string) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { refreshTracks } = useTracks();
  const logger = useLogger('usePlaylistOperations');

  const saveTracksToHistory = async (tracks: any[]) => {
    if (!user || !tracks || tracks.length === 0) {
      logger.info('No tracks to save or user not logged in');
      return { success: false, message: 'No tracks to save or not logged in' };
    }

    try {
      logger.info(`Attempting to save ${tracks.length} tracks to history for user ${user.id}`);

      const formattedTracksForHistory = tracks.map(track => {
        // Log track details for debugging
        logger.debug('Formatting track for history:', { 
          id: track.id || track.spotify_id, 
          title: track.title || track.name
        });

        return {
          user_id: user.id,
          track_id: track.id || track.spotify_id || `track-${Math.random()}`,
          title: track.title || track.name || "Unknown Track",
          artist: Array.isArray(track.artist) ? track.artist.join(", ") : track.artist || "Unknown Artist",
          album: track.album || "Unknown Album",
          platform: track.platform || "spotify",
          key_signature: track.key_signature || track.audio_features?.key || null,
          genre: Array.isArray(track.genre) ? track.genre.join(", ") : (track.genre || ""),
          image_url: track.image_url || track.cover_url || track.image || "",
          external_url: track.external_url || track.platform_url || "",
          bpm: track.bpm || track.audio_features?.bpm || track.audio_features?.tempo || null,
          release_year: track.release_year || null
        };
      });

      logger.debug('Formatted tracks for history:', formattedTracksForHistory);

      const { data, error } = await supabase
        .from("user_track_history")
        .upsert(formattedTracksForHistory, {
          onConflict: 'user_id,track_id',
          ignoreDuplicates: false
        }).select();

      if (error) {
        logger.error("Error saving tracks to history:", error);
        return { success: false, message: `Error: ${error.message}` };
      }

      logger.success(`Successfully saved ${data?.length || 0} tracks to user history`);
      return { success: true, message: `${data?.length || 0} tracks saved to history` };
    } catch (error) {
      const err = error as Error;
      logger.error("Failed to save tracks to history:", err);
      return { success: false, message: `Exception: ${err.message}` };
    }
  };

  const syncExistingPlaylistsToHistory = async () => {
    if (!user) {
      toast.error("Please sign in to sync your library");
      return false;
    }

    try {
      logger.info("Starting to sync existing playlists to track history");
      
      // Fetch all user's playlists
      const { data: playlists, error: playlistsError } = await supabase
        .from("playlists")
        .select("*")
        .eq("user_id", user.id);
        
      if (playlistsError) {
        logger.error("Error fetching playlists for sync:", playlistsError);
        toast.error("Could not fetch your playlists");
        return false;
      }
      
      logger.info(`Found ${playlists?.length || 0} playlists to sync`);
      let totalTracks = 0;
      
      // Process each playlist
      for (const playlist of playlists || []) {
        const results = Array.isArray(playlist.results) 
          ? playlist.results 
          : (typeof playlist.results === 'string' ? JSON.parse(playlist.results) : []);
          
        if (results?.length > 0) {
          logger.info(`Syncing ${results.length} tracks from playlist "${playlist.name}"`);
          const saveResult = await saveTracksToHistory(results);
          
          if (saveResult.success) {
            totalTracks += results.length;
          } else {
            logger.warn(`Issue with playlist "${playlist.name}": ${saveResult.message}`);
          }
        }
      }
      
      if (totalTracks > 0) {
        await refreshTracks();
        toast.success(`Successfully synced ${totalTracks} tracks to your library`);
        return true;
      } else {
        toast.info("No new tracks to sync to your library");
        return false;
      }
    } catch (error) {
      logger.error("Error syncing playlists to history:", error);
      toast.error("Failed to sync tracks to your library");
      return false;
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
        const saveResult = await saveTracksToHistory(playlist.results);
        
        if (!saveResult.success) {
          logger.warn(`Issue saving tracks to history: ${saveResult.message}`);
          toast.warning("Playlist updated but there was an issue updating your library");
        } else {
          logger.success("Tracks successfully saved to history");
        }
        
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
      logger.info("Saving playlist:", { 
        name: playlistData.name, 
        trackCount: playlistData.tracks?.length || 0 
      });
      
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
        logger.error("Error saving playlist:", error);
        toast.error("Failed to save playlist");
        return false;
      }

      // Save tracks to user history
      if (playlistData.tracks && Array.isArray(playlistData.tracks) && playlistData.tracks.length > 0) {
        const saveResult = await saveTracksToHistory(playlistData.tracks);
        
        if (!saveResult.success) {
          logger.warn(`Issue saving tracks to history: ${saveResult.message}`);
          toast.warning("Playlist saved but tracks might not appear in your library");
        } else {
          logger.success("Tracks successfully saved to history");
        }
        
        await refreshTracks();
      }

      toast.success("Playlist saved successfully!");
      return true;
    } catch (error) {
      logger.error("Error in save playlist:", error);
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
    syncExistingPlaylistsToHistory
  };
};
