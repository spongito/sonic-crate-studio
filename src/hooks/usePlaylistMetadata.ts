
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Playlist } from "@/components/Playlists/types";
import { CoverTemplate } from "@/components/PlaylistCover";

export const usePlaylistMetadata = (playlist: Playlist) => {
  const [editedName, setEditedName] = useState(playlist.name);
  const [editedCoverUrl, setEditedCoverUrl] = useState(playlist.cover_image_url || '');
  const [useTemplate, setUseTemplate] = useState(playlist.cover_image_url?.startsWith('template:') || false);
  const [selectedTemplate, setSelectedTemplate] = useState<CoverTemplate>(
    getTemplateFromUrl(playlist.cover_image_url) || 'A'
  );

  // Extract template type from URL format "template:X"
  function getTemplateFromUrl(url?: string): CoverTemplate | null {
    if (!url || !url.startsWith('template:')) return null;
    const template = url.split(':')[1] as CoverTemplate;
    return ['A', 'B', 'C'].includes(template) ? template as CoverTemplate : null;
  }

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
    useTemplate,
    setUseTemplate,
    selectedTemplate,
    setSelectedTemplate,
    updateMetadata
  };
};
