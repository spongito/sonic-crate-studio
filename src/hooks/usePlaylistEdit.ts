
import { useState } from 'react';
import type { Track as TableTrack } from "@/types/table";
import type { Playlist } from "@/components/Playlists/types";
import { usePlaylistMetadata } from './usePlaylistMetadata';
import { usePlaylistTracks } from './usePlaylistTracks';

export const usePlaylistEdit = (playlist: Playlist) => {
  const [isEditing, setIsEditing] = useState(false);
  
  const {
    editedName,
    setEditedName,
    editedCoverUrl,
    setEditedCoverUrl,
    updateMetadata
  } = usePlaylistMetadata(playlist);

  const {
    tracks,
    setTracks,
    updateTrackPositions,
    removeTracks
  } = usePlaylistTracks(playlist.id, playlist.results || []);

  const handleSaveChanges = async () => {
    const metadataUpdated = await updateMetadata();
    const tracksUpdated = await updateTrackPositions();
    
    if (metadataUpdated && tracksUpdated) {
      setIsEditing(false);
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
    handleRemoveTracks: removeTracks
  };
};
