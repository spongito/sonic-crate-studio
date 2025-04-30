
import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Playlist } from "@/components/Playlists/types";

export const usePlaylistMetadata = (playlist: Playlist) => {
  const [editedName, setEditedName] = useState(playlist.name);
  const [editedCoverUrl, setEditedCoverUrl] = useState(playlist.cover_image_url || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [previewCoverUrl, setPreviewCoverUrl] = useState(playlist.cover_image_url || '');

  // Handle image upload completion - updates preview immediately
  const handleImageUploaded = useCallback((url: string) => {
    setPreviewCoverUrl(url);
    setEditedCoverUrl(url);
  }, []);

  // Reset to original cover if cancel is pressed
  const resetCoverToOriginal = useCallback(() => {
    setPreviewCoverUrl(playlist.cover_image_url || '');
    setEditedCoverUrl(playlist.cover_image_url || '');
  }, [playlist.cover_image_url]);
  
  const updateMetadata = async () => {
    try {
      setIsUpdating(true);
      
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
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    editedName,
    setEditedName,
    editedCoverUrl,
    setEditedCoverUrl,
    previewCoverUrl,
    handleImageUploaded,
    resetCoverToOriginal,
    updateMetadata,
    isUpdating
  };
};
