
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Playlist } from "@/components/Playlists/types";

export const usePlaylistMetadata = (playlist: Playlist) => {
  const [editedName, setEditedName] = useState(playlist.name);
  const [editedCoverUrl, setEditedCoverUrl] = useState(playlist.cover_image_url || '');

  const updateMetadata = async () => {
    try {
      const { error } = await supabase
        .from('playlists')
        .update({ 
          name: editedName, 
          cover_image_url: editedCoverUrl 
        })
        .eq('id', playlist.id);

      if (error) throw error;
      
      toast.success('Playlist updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating playlist:', error);
      toast.error('Failed to update playlist metadata');
      return false;
    }
  };

  return {
    editedName,
    setEditedName,
    editedCoverUrl,
    setEditedCoverUrl,
    updateMetadata
  };
};
