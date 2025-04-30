
import React from "react";
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
              coverImageUrl={playlist.cover_image_url}
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
              playlistName={playlist.name}
              showControls={true}
              showLikeButton={true}
              showAddToLibrary={true}
            />
          </div>
        ) : null}

        {playlist && (
          <PlaylistEditModal 
            isOpen={isEditing}
            playlistName={playlist.name}
            coverImageUrl={playlist.cover_image_url || ''}
            onClose={() => setIsEditing(false)}
            onSave={(name, coverUrl) => {
              updatePlaylistData(name, coverUrl);
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default PlaylistDetail;
