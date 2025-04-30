
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Playlist } from "@/components/Playlists/types";
import type { Json } from "@/integrations/supabase/types";

export const fetchPlaylistById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("playlists")
      .select("*")
      .eq("id", id)
      .single();
      
    if (error) {
      throw error;
    }
    
    return {
      data,
      error: null
    };
  } catch (error) {
    console.error("Error fetching playlist:", error);
    return {
      data: null,
      error
    };
  }
};

export const updatePlaylist = async (id: string, updates: Partial<Playlist>) => {
  try {
    // Create a new object with properly typed properties
    const supabaseUpdates: Record<string, any> = {};
    
    // Only include the properties that are provided in updates
    if (updates.name !== undefined) supabaseUpdates.name = updates.name;
    if (updates.cover_image_url !== undefined) supabaseUpdates.cover_image_url = updates.cover_image_url;
    if (updates.description !== undefined) supabaseUpdates.description = updates.description;
    if (updates.is_public !== undefined) supabaseUpdates.is_public = updates.is_public;
    if (updates.tags !== undefined) supabaseUpdates.tags = updates.tags;
    if (updates.genres !== undefined) supabaseUpdates.genres = updates.genres;
    
    // Handle results specially - convert to JSON if present
    if (updates.results !== undefined) {
      supabaseUpdates.results = updates.results as unknown as Json;
    }
    
    const { error } = await supabase
      .from("playlists")
      .update(supabaseUpdates)
      .eq("id", id);
    
    if (error) {
      throw error;
    }
    
    toast.success("Playlist updated successfully");
    return true;
  } catch (error) {
    console.error("Error updating playlist:", error);
    toast.error("Failed to update playlist");
    return false;
  }
};

export const deletePlaylist = async (id: string) => {
  try {
    const { error } = await supabase
      .from("playlists")
      .delete()
      .eq("id", id);
    
    if (error) {
      throw error;
    }
    
    toast.success("Playlist deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting playlist:", error);
    toast.error("Failed to delete playlist");
    return false;
  }
};

export interface UploadMetadata {
  fileType: string;
  sizeBytes: number;
  width: number;
  height: number;
}

// This function could be expanded if you want to store image metadata in a separate table
export const storeImageMetadata = async (
  playlistId: string, 
  imageUrl: string, 
  metadata: UploadMetadata
) => {
  try {
    // You could create a separate table for image_uploads if needed
    // For now, we'll just log the metadata
    console.log('Image uploaded with metadata:', {
      playlistId,
      imageUrl,
      metadata
    });
    
    return true;
  } catch (error) {
    console.error('Error storing image metadata:', error);
    return false;
  }
};
