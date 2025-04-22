
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Track } from "@/types/table";
import type { Playlist } from "@/components/Playlists/types";

export const usePlaylistEdit = (playlist: Playlist) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(playlist.name);
  const [editedCoverUrl, setEditedCoverUrl] = useState(playlist.cover_image_url || '');
  const [tracks, setTracks] = useState<Track[]>(playlist.results || []);

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
          onConflict: 'track_id,playlist_id',
          returning: 'minimal'
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
