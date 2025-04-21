
import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

// Sample playlists - in a real app, these would come from the database
const samplePlaylists = [
  {
    id: '1',
    title: 'Late Night Sessions',
    cover_url: 'https://picsum.photos/seed/playlist1/300',
    track_count: 12,
    created_at: '2023-05-15T12:00:00Z',
  },
  {
    id: '2',
    title: 'Summer Club Mix',
    cover_url: 'https://picsum.photos/seed/playlist2/300',
    track_count: 18,
    created_at: '2023-06-01T12:00:00Z',
  },
  {
    id: '3',
    title: 'Deep Focus',
    cover_url: 'https://picsum.photos/seed/playlist3/300',
    track_count: 8,
    created_at: '2023-02-12T12:00:00Z',
  },
];

export const YourPlaylists: React.FC = () => {
  // Sort playlists by creation date (newest first)
  const sortedPlaylists = [...samplePlaylists].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Your Playlists</h2>
        <Link to="/playlists" className="text-xs text-gold hover:underline">
          View All
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sortedPlaylists.map((playlist) => (
          <Link 
            to={`/playlists/${playlist.id}`}
            key={playlist.id}
            className="block group"
          >
            <div className="neo-card overflow-hidden rounded-lg transition-all duration-300">
              <div className="aspect-square overflow-hidden">
                <img 
                  src={playlist.cover_url} 
                  alt={playlist.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 space-y-1">
                <h3 className="font-medium text-white group-hover:text-gold transition-colors">
                  {playlist.title}
                </h3>
                <div className="flex justify-between text-xs text-white/60">
                  <span>{playlist.track_count} tracks</span>
                  <span>{formatDistanceToNow(new Date(playlist.created_at), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
