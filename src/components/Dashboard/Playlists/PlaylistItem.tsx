
import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Music, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Playlist } from '@/hooks/useYourPlaylists';

interface PlaylistItemProps {
  playlist: Playlist;
  onEdit: (playlist: Playlist) => void;
}

export const PlaylistItem: React.FC<PlaylistItemProps> = ({ playlist, onEdit }) => {
  return (
    <div key={playlist.id} className="block group">
      <div className="neo-card overflow-hidden rounded-lg transition-all duration-300">
        <Link to={`/playlists/${playlist.id}`} className="block">
          <div className="aspect-square overflow-hidden">
            {playlist.cover_image_url ? (
              <img 
                src={playlist.cover_image_url} 
                alt={playlist.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  // If image fails to load, use fallback
                  const target = e.target as HTMLImageElement;
                  target.src = `https://picsum.photos/seed/${playlist.id}/300`;
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-800 to-gray-900">
                <Music className="h-1/3 w-1/3 text-gray-500" />
              </div>
            )}
          </div>
        </Link>
        <div className="p-4 space-y-1">
          <div className="flex justify-between items-center">
            <Link to={`/playlists/${playlist.id}`} className="block">
              <h3 className="font-medium text-white group-hover:text-gold transition-colors">
                {playlist.name}
              </h3>
            </Link>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(playlist)}
              className="h-8 p-0 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex justify-between text-xs text-white/60">
            <span>{Array.isArray(playlist.results) ? playlist.results.length : 0} tracks</span>
            <span>{formatDistanceToNow(new Date(playlist.created_at), { addSuffix: true })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
