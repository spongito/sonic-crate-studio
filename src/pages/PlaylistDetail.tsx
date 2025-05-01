
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { Separator } from "@/components/ui/separator";
import { PlaylistActions } from "@/components/Playlists/PlaylistActions/PlaylistActions";
import { PlaylistEditModal } from "@/components/Playlists/PlaylistEditModal";
import { PlaylistHeader } from "@/components/Playlists/PlaylistHeader/PlaylistHeader";
import { LoadingState } from "@/components/Playlists/PlaylistDetail/LoadingState";
import { NotFoundState } from "@/components/Playlists/PlaylistDetail/NotFoundState";
import { usePlaylistDetail } from "@/hooks/usePlaylistDetail";
import TabPlaylistView from "@/components/TabPlaylistView";
import BackButton from "@/components/common/BackButton";
import { toast } from "sonner";
import { useTracks } from "@/context/TracksContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const PlaylistDetail = () => {
  const {
    playlist,
    loading,
    notFound,
    unauthorized,
    isEditing,
    setIsEditing,
    tracks,
    handleDelete,
    updatePlaylistData
  } = usePlaylistDetail();
  
  const { toggleLike } = useTracks();
  const { user } = useAuth();
  const [currentCoverImageUrl, setCurrentCoverImageUrl] = useState<string | null>(null);
  const [userLikedTrackIds, setUserLikedTrackIds] = useState<string[]>([]);
  const [fetchingLikedTracks, setFetchingLikedTracks] = useState(false);

  // Initialize the cover image URL when playlist data is loaded
  useEffect(() => {
    if (playlist?.cover_image_url) {
      setCurrentCoverImageUrl(playlist.cover_image_url);
    }
  }, [playlist]);

  // Fetch user's liked track IDs when component loads
  useEffect(() => {
    const fetchLikedTracks = async () => {
      if (!user) return;
      
      try {
        setFetchingLikedTracks(true);
        const { data: likedTracksData, error } = await supabase
          .from("liked_tracks")
          .select("track_id")
          .eq("user_id", user.id);

        if (error) {
          console.error("Error fetching liked tracks:", error);
          return;
        }

        const likedIds = likedTracksData.map(item => item.track_id);
        console.log("Fetched liked track IDs:", likedIds);
        setUserLikedTrackIds(likedIds);
      } catch (error) {
        console.error("Error in fetchLikedTracks:", error);
      } finally {
        setFetchingLikedTracks(false);
      }
    };

    fetchLikedTracks();
  }, [user]);

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

  // Handle like change with NEW liked state
  const handleLikeChange = async (trackId: string, liked: boolean) => {
    try {
      console.log(`PlaylistDetail handling like change: ${trackId}, new state: ${liked}`);
      
      // Since toggleLike expects the CURRENT state before toggling,
      // we need to pass the opposite of the new liked state
      await toggleLike(trackId, !liked);
      
      // Update the local state immediately for UI responsiveness
      if (liked) {
        setUserLikedTrackIds(prev => Array.from(new Set([...prev, trackId])));
      } else {
        setUserLikedTrackIds(prev => prev.filter(id => id !== trackId));
      }
      
      toast.success(liked ? "Added to your favorites" : "Removed from your favorites");
    } catch (error) {
      console.error("Error toggling track like:", error);
      toast.error("Failed to update liked status");
    }
  };

  const handlePlaylistUpdate = async (name: string, coverUrl: string) => {
    const success = await updatePlaylistData(name, coverUrl);
    if (success) {
      setCurrentCoverImageUrl(coverUrl);
    }
    return success;
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <BackButton to="/playlists" />
        
        {loading ? (
          <LoadingState />
        ) : playlist ? (
          <div className="space-y-6">
            <PlaylistHeader
              playlist={playlist}
              tracks={tracks}
              onEditClick={() => setIsEditing(true)}
              coverImageUrl={currentCoverImageUrl}
            />

            <PlaylistActions 
              playlistId={playlist.id} 
              onDelete={handleDelete}
              onShare={() => {}}
              onEdit={() => setIsEditing(true)}
            />

            <Separator className="my-6" />

            <TabPlaylistView 
              tracks={tracks}
              userLikedTrackIds={userLikedTrackIds}
              onLikeChange={handleLikeChange}
              playlistName={playlist.name}
              coverImageUrl={currentCoverImageUrl}
              onPlaylistUpdate={handlePlaylistUpdate}
              className="pt-2"
            />
          </div>
        ) : null}

        {playlist && (
          <PlaylistEditModal 
            isOpen={isEditing}
            playlistName={playlist.name}
            coverImageUrl={currentCoverImageUrl || ''}
            onClose={() => setIsEditing(false)}
            onSave={(name, coverUrl) => {
              updatePlaylistData(name, coverUrl).then(success => {
                if (success) {
                  setCurrentCoverImageUrl(coverUrl);
                  setIsEditing(false);
                }
              });
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default PlaylistDetail;
