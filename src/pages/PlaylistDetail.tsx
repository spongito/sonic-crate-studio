
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
  const [currentCoverImageUrl, setCurrentCoverImageUrl] = useState<string | null>(null);

  // Initialize the cover image URL when playlist data is loaded
  useEffect(() => {
    if (playlist?.cover_image_url) {
      setCurrentCoverImageUrl(playlist.cover_image_url);
    }
  }, [playlist]);

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

  const handleLikeChange = async (trackId: string, liked: boolean) => {
    try {
      await toggleLike(trackId, !liked);
      toast.success(liked ? "Added to your liked tracks" : "Removed from your liked tracks");
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
              userLikedTrackIds={[]}
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
