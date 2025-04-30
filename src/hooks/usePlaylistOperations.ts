
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updatePlaylist, deletePlaylist } from '@/services/PlaylistService';
import type { Playlist } from '@/components/Playlists/types';

export const usePlaylistOperations = (playlist: Playlist | null, id: string | undefined) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

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
