
import React from 'react';
import { Link } from 'react-router-dom';

export const EmptyPlaylistState: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Your Playlists</h2>
        <Link to="/playlists" className="text-xs text-gold hover:underline">
          View All
        </Link>
      </div>
      <div className="neo-card p-6 text-center">
        <p className="text-white/60">No playlists created yet.</p>
        <Link to="/music-finder" className="text-gold hover:underline mt-2 block">
          Create your first playlist
        </Link>
      </div>
    </div>
  );
};
