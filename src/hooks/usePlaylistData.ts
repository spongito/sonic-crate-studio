
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPlaylistById } from '@/services/PlaylistService';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { convertPlaylistTracks } from '@/utils/playlistUtils';
import type { Playlist } from '@/components/Playlists/types';
import type { Track as TableTrack } from "@/types/table";

interface PlaylistDataState {
  playlist: Playlist | null;
  loading: boolean;
  notFound: boolean;
  unauthorized: boolean;
  tracks: TableTrack[];
}

export const usePlaylistData = () => {
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState<PlaylistDataState>({
    playlist: null,
    loading: true,
    notFound: false,
    unauthorized: false,
    tracks: []
  });
  const { user } = useAuth();

  useEffect(() => {
    const loadPlaylist = async () => {
      if (!id) return;
      
      try {
        setState(prev => ({ ...prev, loading: true }));
        
        const { data, error } = await fetchPlaylistById(id);
        
        if (error || !data) {
          setState(prev => ({ ...prev, notFound: true, loading: false }));
          return;
        }
        
        if (data.user_id !== user?.id) {
          setState(prev => ({ ...prev, unauthorized: true, loading: false }));
          return;
        }
        
        const processedResults = Array.isArray(data.results) 
          ? data.results 
          : (typeof data.results === 'string' ? JSON.parse(data.results) : []);
        
        const formattedPlaylist: Playlist = {
          ...data,
          results: processedResults,
        };
        
        const transformedResults = processedResults 
          ? convertPlaylistTracks(processedResults) 
          : [];
        
        setState({
          playlist: formattedPlaylist,
          tracks: transformedResults,
          loading: false,
          notFound: false,
          unauthorized: false
        });
      } catch (error) {
        console.error("Error fetching playlist:", error);
        toast.error("Failed to load playlist details");
        setState(prev => ({
          ...prev,
          notFound: true,
          loading: false
        }));
      }
    };
    
    loadPlaylist();
  }, [id, user?.id]);

  return state;
};
