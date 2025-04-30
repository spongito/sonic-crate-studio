
import React from 'react';
import { Link } from 'react-router-dom';
import { PlaylistEditModal } from "@/components/Playlists/PlaylistEditModal";
import { PlaylistItem } from './Playlists/PlaylistItem';
import { PlaylistsLoading } from './Playlists/PlaylistsLoading';
import { EmptyPlaylistState } from './Playlists/EmptyPlaylistState';
import { useYourPlaylists } from '@/hooks/useYourPlaylists';

export const YourPlaylists: React.FC = () => {
  const {
    playlists,
    loading,
    editingPlaylist,
    isEditModalOpen,
    setIsEditModalOpen,
    setEditingPlaylist,
    handleEditClick,
    handleSaveEditedPlaylist
  } = useYourPlaylists();

  if (loading) {
    return <PlaylistsLoading />;
  }

  if (!loading && playlists.length === 0) {
    return <EmptyPlaylistState />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Your Playlists</h2>
        <Link to="/playlists" className="text-xs text-gold hover:underline">
          View All
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {playlists.map((playlist) => (
          <PlaylistItem 
            key={playlist.id} 
            playlist={playlist} 
            onEdit={handleEditClick} 
          />
        ))}
      </div>

      {editingPlaylist && (
        <PlaylistEditModal
          isOpen={isEditModalOpen}
          playlistName={editingPlaylist.name}
          coverImageUrl={editingPlaylist.cover_image_url || ''}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingPlaylist(null);
          }}
          onSave={handleSaveEditedPlaylist}
        />
      )}
    </div>
  );
};
