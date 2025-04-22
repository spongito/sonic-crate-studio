import React, { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { PlaylistActions } from "@/components/Playlists/PlaylistActions/PlaylistActions";
import { type Playlist, type Track as PlaylistTrack } from "@/components/Playlists/types";
import GeneratedPlaylistTable from "@/components/GeneratedPlaylistTable";
import type { Track } from "@/types/table";
import { usePlaylistEdit } from "@/hooks/usePlaylistEdit";
import { PlaylistEditModal } from "@/components/Playlists/PlaylistEditModal";
import { PlaylistHeader } from "@/components/Playlists/PlaylistHeader/PlaylistHeader";
import { LoadingState } from "@/components/Playlists/PlaylistDetail/LoadingState";
import { NotFoundState } from "@/components/Playlists/PlaylistDetail/NotFoundState";

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
        
        if (data.user_id !== user?.id) {
          setUnauthorized(true);
          return;
        }
        
        const processedResults = Array.isArray(data.results) 
          ? data.results 
          : (typeof data.results === 'string' ? JSON.parse(data.results) : []);
        
        const formattedPlaylist: Playlist = {
          ...data,
          results: processedResults as PlaylistTrack[],
        };
        
        setPlaylist(formattedPlaylist);
        
        const transformedResults = processedResults ? convertPlaylistTracks(processedResults) : [];
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
            />

            <PlaylistActions 
              playlistId={playlist.id} 
              onDelete={handleDelete}
              onShare={() => {}}
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
};

export default PlaylistDetail;
