
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Track as TableTrack } from "@/types/table";
import type { Track as PlaylistTrack, Playlist } from "@/components/Playlists/types";

// Helper function to convert between track types
const convertPlaylistTrackToTableTrack = (track: PlaylistTrack): TableTrack => {
  return {
    id: track.spotify_id || track.youtube_id || track.id || '',
    title: track.title,
    artist: Array.isArray(track.artist) ? track.artist : [track.artist],
    album: track.album || '',
    platform: track.platform || 'spotify',
    image_url: track.cover_url || '',
    bpm: track.audio_features?.bpm || null,
    key_signature: track.key_signature || undefined,
    genre: track.genre || null,
    release_year: track.release_year,
    duration: track.duration || '',
    platform_url: track.platform_url || track.external_url || '',
  };
};

export const usePlaylistEdit = (playlist: Playlist) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(playlist.name);
  const [editedCoverUrl, setEditedCoverUrl] = useState(playlist.cover_image_url || '');
  const [tracks, setTracks] = useState<TableTrack[]>(
    playlist.results ? playlist.results.map(convertPlaylistTrackToTableTrack) : []
  );

  const handleSaveChanges = async () => {
    try {
      // Update playlist metadata
      const { error } = await supabase
        .from('playlists')
        .update({ 
          name: editedName, 
          cover_image_url: editedCoverUrl 
        })
        .eq('id', playlist.id);

      if (error) throw error;

      // Update track positions if needed
      const trackUpdates = tracks.map((track, index) => ({
        track_id: track.id,
        position: index,
        playlist_id: playlist.id
      }));

      // Bulk update track positions
      const { error: trackError } = await supabase
        .from('playlist_tracks')
        .upsert(trackUpdates, { 
          onConflict: 'track_id,playlist_id'
        });

      if (trackError) throw trackError;

      toast.success('Playlist updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating playlist:', error);
      toast.error('Failed to update playlist');
    }
  };

  const handleRemoveTracks = async (tracksToRemove: string[]) => {
    try {
      const { error } = await supabase
        .from('playlist_tracks')
        .delete()
        .eq('playlist_id', playlist.id)
        .in('track_id', tracksToRemove);

      if (error) throw error;

      // Remove tracks from local state
      setTracks(tracks.filter(track => !tracksToRemove.includes(track.id)));
      
      toast.success(`Removed ${tracksToRemove.length} track(s)`);
    } catch (error) {
      console.error('Error removing tracks:', error);
      toast.error('Failed to remove tracks');
    }
  };

  return {
    isEditing,
    setIsEditing,
    editedName,
    setEditedName,
    editedCoverUrl,
    setEditedCoverUrl,
    tracks,
    setTracks,
    handleSaveChanges,
    handleRemoveTracks
  };
};
