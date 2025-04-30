
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updatePlaylist, deletePlaylist } from '@/services/PlaylistService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useTracks } from '@/context/TracksContext';
import type { Playlist } from '@/components/Playlists/types';

export const usePlaylistOperations = (playlist: Playlist | null, id: string | undefined) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();
  const { refreshTracks } = useTracks();

  const saveTracksToHistory = async (tracks: any[]) => {
    if (!user || !tracks || tracks.length === 0) return;

    try {
      const formattedTracksForHistory = tracks.map(track => ({
        user_id: user.id,
        track_id: track.id || track.spotify_id,
        title: track.title || track.name || "Unknown Track",
        artist: Array.isArray(track.artist) ? track.artist.join(", ") : track.artist || "Unknown Artist",
        album: track.album || "Unknown Album",
        platform: track.platform || "spotify",
        key_signature: track.key_signature || track.audio_features?.key,
        genre: Array.isArray(track.genre) ? track.genre.join(", ") : track.genre || "",
        image_url: track.image_url || track.cover_url || track.image || "",
        external_url: track.external_url || track.platform_url || "",
        bpm: track.bpm || track.audio_features?.bpm || track.audio_features?.tempo,
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
      }
    } catch (error) {
      console.error("Failed to save tracks to history:", error);
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

  return {
    isEditing,
    setIsEditing,
    handleDelete,
    updatePlaylistData
  };
};
