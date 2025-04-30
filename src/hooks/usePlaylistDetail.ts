
import { useParams } from 'react-router-dom';
import { usePlaylistData } from './usePlaylistData';
import { usePlaylistOperations } from './usePlaylistOperations';
import { usePlaylistEdit } from '@/hooks/usePlaylistEdit';
import type { Playlist } from '@/components/Playlists/types';

export const usePlaylistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { playlist, loading, notFound, unauthorized, tracks } = usePlaylistData();
  const { isEditing, setIsEditing, handleDelete, updatePlaylistData } = usePlaylistOperations(playlist, id);

  const {
    editedName,
    setEditedName,
    editedCoverUrl,
    setEditedCoverUrl,
    handleSaveChanges,
    handleRemoveTracks
  } = usePlaylistEdit(playlist || {} as Playlist);

  return {
    id,
    playlist,
    loading,
    notFound,
    unauthorized,
    isEditing,
    setIsEditing,
    tracks,
    handleDelete,
    updatePlaylistData,
    editedName,
    setEditedName,
    editedCoverUrl,
    setEditedCoverUrl,
    handleSaveChanges,
    handleRemoveTracks
  };
};
