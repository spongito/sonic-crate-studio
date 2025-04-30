
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Json } from '@/integrations/supabase/types';

interface Playlist {
  id: string;
  name: string;
  cover_image_url?: string;
  created_at: string;
  results: any[];
}

// Interface to match the actual data from Supabase
interface PlaylistFromDB {
  id: string;
  name: string;
  cover_image_url?: string;
  created_at: string;
  results: Json;
  description: string;
  genres: string[];
  is_public: boolean;
  prompt: string;
  settings: Json;
  tags: string[];
  updated_at: string;
  user_id: string;
}

export const useYourPlaylists = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchPlaylists = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from("playlists")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(3); // Only get the 3 most recent playlists
        
        if (error) {
          console.error("Error fetching playlists for dashboard:", error);
          return;
        }
        
        // Transform the data to match our Playlist interface
        const transformedPlaylists: Playlist[] = (data as PlaylistFromDB[]).map(playlist => ({
          id: playlist.id,
          name: playlist.name,
          cover_image_url: playlist.cover_image_url,
          created_at: playlist.created_at,
          results: Array.isArray(playlist.results) ? playlist.results : 
                  typeof playlist.results === 'string' ? JSON.parse(playlist.results) : 
                  [],
        }));
        
        setPlaylists(transformedPlaylists);
      } catch (error) {
        console.error("Error in dashboard playlists fetch:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlaylists();
  }, [user]);

  const handleEditClick = (playlist: Playlist) => {
    setEditingPlaylist(playlist);
    setIsEditModalOpen(true);
  };

  const handleSaveEditedPlaylist = async (name: string, coverUrl: string) => {
    if (!editingPlaylist) return;
    
    try {
      const { error } = await supabase
        .from("playlists")
        .update({ 
          name: name,
          cover_image_url: coverUrl 
        })
        .eq("id", editingPlaylist.id)
        .eq("user_id", user?.id);

      if (error) {
        console.error("Error updating playlist:", error);
        toast.error("Failed to update playlist");
        return;
      }

      // Update local state
      setPlaylists(prevPlaylists => 
        prevPlaylists.map(playlist => 
          playlist.id === editingPlaylist.id 
            ? { ...playlist, name: name, cover_image_url: coverUrl } 
            : playlist
        )
      );

      toast.success("Playlist updated successfully");
      setIsEditModalOpen(false);
      setEditingPlaylist(null);
    } catch (error) {
      console.error("Error in playlist update:", error);
      toast.error("Something went wrong");
    }
  };

  return {
    playlists,
    loading,
    editingPlaylist,
    isEditModalOpen,
    setIsEditModalOpen,
    setEditingPlaylist,
    handleEditClick,
    handleSaveEditedPlaylist
  };
};

export type { Playlist };
