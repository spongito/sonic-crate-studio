
import { useParams, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { type Playlist } from "@/components/Playlists/types";
import { PlaylistHeader } from "@/components/Playlists/PlaylistHeader/PlaylistHeader";
import { PlaylistActions } from "@/components/Playlists/PlaylistActions/PlaylistActions";
import { Separator } from "@/components/ui/separator";
import { PlaylistEditModal } from "@/components/Playlists/PlaylistEditModal";
import { usePlaylistEdit } from "@/hooks/usePlaylistEdit";
import { LoadingState } from "@/components/Playlists/PlaylistDetail/LoadingState";
import { NotFoundState } from "@/components/Playlists/PlaylistDetail/NotFoundState";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import GeneratedPlaylistTable from "@/components/GeneratedPlaylistTable";

export default function PlaylistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const {
    isEditing,
    setIsEditing,
    editedName,
    setEditedName,
    editedCoverUrl,
    setEditedCoverUrl,
    tracks,
    handleSaveChanges,
    handleRemoveTracks
  } = usePlaylistEdit(playlist || {} as Playlist);

  useEffect(() => {
    const fetchPlaylist = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from("playlists")
          .select("*")
          .eq("id", id)
          .single();
          
        if (error) {
          console.error("Error fetching playlist:", error);
          setNotFound(true);
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
      } catch (error) {
        console.error("Error fetching playlist:", error);
        toast.error("Failed to load playlist details");
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlaylist();
  }, [id]);

  const handleDelete = async () => {
    if (!id || !playlist) return;
    
    try {
      const { error } = await supabase
        .from("playlists")
        .delete()
        .eq("id", id);
      
      if (error) {
        console.error("Error deleting playlist:", error);
        toast.error("Failed to delete playlist");
        return;
      }
      
      toast.success("Playlist deleted successfully");
      window.location.href = "/playlists";
    } catch (error) {
      console.error("Error deleting playlist:", error);
      toast.error("Something went wrong");
    }
  };

  const handleShare = () => {
    // Implement share functionality later
    toast.info("Share functionality coming soon!");
  };

  const handleNameChange = async (newName: string) => {
    if (!id || !playlist || !newName.trim()) return;
    
    try {
      const { error } = await supabase
        .from("playlists")
        .update({ name: newName })
        .eq("id", id);
        
      if (error) {
        console.error("Error updating playlist name:", error);
        toast.error("Failed to update playlist name");
        return false;
      }
      
      // Update local state
      setPlaylist({
        ...playlist,
        name: newName
      });
      
      toast.success("Playlist name updated successfully");
      return true;
    } catch (error) {
      console.error("Error updating playlist name:", error);
      toast.error("Something went wrong");
      return false;
    }
  };

  if (notFound) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-12">
          <NotFoundState />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <LoadingState />
        ) : playlist ? (
          <div className="space-y-6">
            <PlaylistHeader
              playlist={playlist}
              tracks={tracks}
              onEditClick={() => setIsEditing(true)}
              coverImageUrl={editedCoverUrl || (tracks[0]?.image_url || '')}
              onNameChange={handleNameChange}
            />

            <PlaylistActions 
              playlistId={playlist.id} 
              onDelete={handleDelete}
              onShare={handleShare}
            />

            <Separator className="my-6" />

            <div>
              <h2 className="text-xl font-bold mb-4">Tracks</h2>
              <GeneratedPlaylistTable 
                tracks={tracks}
                showControls={false}
                fullWidth={true}
                playlistName={playlist.name}
              />
            </div>
          </div>
        ) : null}

        {playlist && (
          <PlaylistEditModal 
            isOpen={isEditing}
            playlistName={playlist.name}
            coverImageUrl={editedCoverUrl || ((tracks[0]?.image_url) || '')}
            onClose={() => setIsEditing(false)}
            onSave={(name, coverUrl) => {
              setEditedName(name);
              setEditedCoverUrl(coverUrl);
              handleSaveChanges();
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
