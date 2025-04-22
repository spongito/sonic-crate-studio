
import React, { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { toast } from "sonner";
import { PlaylistActions } from "@/components/Playlists/PlaylistActions/PlaylistActions";
import { type Playlist } from "@/components/Playlists/types";
import GeneratedPlaylistTable from "@/components/GeneratedPlaylistTable";
import type { Track } from "@/types/table";
import { usePlaylistEdit } from "@/hooks/usePlaylistEdit";
import { PlaylistEditModal } from "@/components/Playlists/PlaylistEditModal";
import { Edit } from "lucide-react";

// Helper function to convert playlist track to table track
const convertPlaylistTracks = (playlistResults: any[]): Track[] => {
  return playlistResults.map(track => ({
    id: track.spotify_id || track.youtube_id || track.id || '',
    title: track.title,
    artist: Array.isArray(track.artist) ? track.artist : [track.artist],
    album: track.album || '',
    platform: track.platform || 'spotify',
    image_url: track.cover_url || '',
    bpm: track.audio_features?.bpm || null,
    key_signature: track.key_signature || undefined,
    genre: track.genre || null,
    release_year: track.release_year,
    duration: track.duration || '',
    platform_url: track.platform_url || track.external_url || '',
  }));
};

const PlaylistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const { user } = useAuth();

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
        
        // Check if the user is the owner of this playlist
        if (data.user_id !== user?.id) {
          setUnauthorized(true);
          return;
        }
        
        // Transform the results JSON into Track[] format
        const transformedResults = data.results ? convertPlaylistTracks(data.results as any[]) : [];

        setPlaylist({
          ...data,
          results: data.results || [],
        } as Playlist);
        
        setTracks(transformedResults);
      } catch (error) {
        console.error("Error fetching playlist:", error);
        toast.error("Failed to load playlist details");
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlaylist();
  }, [id, user?.id]);

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

  if (unauthorized) {
    return <Navigate to="/playlists" />;
  }

  if (notFound) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-lg mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4 text-white">Playlist Not Found</h1>
            <p className="text-lg text-muted-foreground mb-8">
              This playlist doesn't exist or has been removed.
            </p>
            <Button asChild>
              <a href="/playlists">Back to Playlists</a>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="h-12 w-12 rounded-full border-4 border-gold border-t-transparent animate-spin"></div>
            <p className="mt-4 text-muted-foreground">Loading playlist...</p>
          </div>
        ) : playlist ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
              {/* Playlist Cover Image */}
              <div className="aspect-square rounded-lg overflow-hidden bg-muted shadow-lg relative">
                <img 
                  src={(editedCoverUrl || tracks[0]?.image_url) || "/placeholder.svg"} 
                  alt={playlist.name}
                  className="w-full h-full object-cover"
                />
                {user?.id === playlist.user_id && (
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="absolute top-2 right-2"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="w-5 h-5" />
                  </Button>
                )}
              </div>

              {/* Playlist Info */}
              <div className="space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-white">{playlist.name}</h1>
                  <p className="text-muted-foreground">
                    {playlist.description || playlist.prompt}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <span>Created {format(new Date(playlist.created_at), "MMM d, yyyy")}</span>
                  <span>•</span>
                  <span>{tracks.length || 0} tracks</span>
                  {playlist.genres && playlist.genres.length > 0 && (
                    <>
                      <span>•</span>
                      <span>{playlist.genres.join(", ")}</span>
                    </>
                  )}
                </div>

                <PlaylistActions 
                  playlistId={playlist.id} 
                  onDelete={handleDelete}
                  onShare={() => {}}
                />
              </div>
            </div>

            <Separator className="my-6" />

            {/* Tracks Table */}
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

        {/* Edit Modal */}
        {playlist && (
          <PlaylistEditModal 
            isOpen={isEditing}
            playlistName={playlist.name}
            coverImageUrl={editedCoverUrl || (tracks[0]?.image_url || '')}
            onClose={() => setIsEditing(false)}
            onSave={(name, coverUrl) => {
              // Update local state
              setEditedName(name);
              setEditedCoverUrl(coverUrl);
              // Save to Supabase
              handleSaveChanges();
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default PlaylistDetail;
