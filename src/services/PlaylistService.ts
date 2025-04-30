
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Playlist } from "@/components/Playlists/types";

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
    const { error } = await supabase
      .from("playlists")
      .update(updates)
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
