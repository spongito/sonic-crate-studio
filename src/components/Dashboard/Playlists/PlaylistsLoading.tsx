
import React from 'react';
import { Link } from 'react-router-dom';
import { PlaylistSkeleton } from "@/components/Playlists/PlaylistSkeleton";

export const PlaylistsLoading: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Your Playlists</h2>
        <Link to="/playlists" className="text-xs text-gold hover:underline">
          View All
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PlaylistSkeleton count={3} />
      </div>
    </div>
  );
};
