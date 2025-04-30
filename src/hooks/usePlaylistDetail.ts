
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPlaylistById, updatePlaylist, deletePlaylist } from '@/services/PlaylistService';
import { useAuth } from '@/context/AuthContext';
import { usePlaylistEdit } from '@/hooks/usePlaylistEdit';
import { convertPlaylistTracks } from '@/utils/playlistUtils';
import { toast } from 'sonner';
import type { Playlist } from '@/components/Playlists/types';

export const usePlaylistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
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
  } = usePlaylistEdit(playlist || {} as Playlist);

  useEffect(() => {
    const loadPlaylist = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await fetchPlaylistById(id);
        
        if (error || !data) {
          setNotFound(true);
          return;
        }
        
        if (data.user_id !== user?.id) {
          setUnauthorized(true);
          return;
        }
        
        const processedResults = Array.isArray(data.results) 
          ? data.results 
          : (typeof data.results === 'string' ? JSON.parse(data.results) : []);
        
        const formattedPlaylist: Playlist = {
          ...data,
          results: processedResults,
        };
        
        setPlaylist(formattedPlaylist);
        
        const transformedResults = processedResults 
          ? convertPlaylistTracks(processedResults) 
          : [];
        
        setTracks(transformedResults);
        
        // Set initial values for edited properties
        setEditedName(formattedPlaylist.name);
        setEditedCoverUrl(formattedPlaylist.cover_image_url || '');
      } catch (error) {
        console.error("Error fetching playlist:", error);
        toast.error("Failed to load playlist details");
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    
    loadPlaylist();
  }, [id, user?.id, setEditedName, setEditedCoverUrl]);

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
      // Update local state
      setPlaylist({
        ...playlist,
        name: name,
        cover_image_url: coverUrl
      });
      
      setEditedName(name);
      setEditedCoverUrl(coverUrl);
      return true;
    }
    
    return false;
  };

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
    updatePlaylistData
  };
};
