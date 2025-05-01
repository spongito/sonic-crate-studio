
import React from 'react';
import { Link } from 'react-router-dom';
import TrackLikeButton from '@/components/TrackLikeButton';
import { formatDuration } from '@/lib/utils';
import { useTracks } from '@/context/TracksContext';
import { toast } from 'sonner';

export const RecentlyLikedTracks: React.FC = () => {
  const { likedTracks, toggleLike } = useTracks();
  
  // Take only the 5 most recent liked tracks
  const recentLikedTracks = likedTracks.slice(0, 5);

  // Helper function to handle duration formatting
  const handleDurationFormat = (duration: string | number): string => {
    if (typeof duration === 'number') {
      return formatDuration(duration);
    }
    return duration; // If it's already a string, return as is
  };

  const handleToggleLike = async (trackId: string, liked: boolean) => {
    try {
      // Important: TrackLikeButton passes the NEW state after toggling
      // but toggleLike expects the CURRENT state BEFORE toggling
      // So we need to invert the value here
      await toggleLike(trackId, !liked);
      toast.success(liked ? "Added to your favorites" : "Removed from your favorites");
    } catch (error) {
      console.error('Error toggling track like:', error);
      toast.error("Failed to update track status");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Recently Liked Tracks</h2>
        <Link 
          to="/library?tab=liked" 
          className="text-xs text-gold hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="space-y-2">
        {recentLikedTracks.length === 0 ? (
          <p className="text-white/60 text-sm">No liked tracks yet</p>
        ) : (
          recentLikedTracks.map((track) => (
            <div 
              key={track.id}
              className="flex items-center justify-between p-3 rounded-lg transition-all hover:bg-white/5"
            >
              <div className="flex items-center space-x-3">
                <img 
                  src={track.image_url || '/placeholder.svg'} 
                  alt={track.title}
                  className="w-12 h-12 rounded object-cover"
                />
                <div>
                  <h3 className="font-medium text-white">{track.title}</h3>
                  <p className="text-sm text-white/60">
                    {Array.isArray(track.artist) ? track.artist.join(', ') : track.artist}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="hidden md:flex space-x-4">
                  {track.bpm && (
                    <span className="text-xs bg-white/10 px-2 py-1 rounded">
                      {track.bpm} BPM
                    </span>
                  )}
                  {track.key_signature && (
                    <span className="text-xs bg-white/10 px-2 py-1 rounded">
                      {track.key_signature}
                    </span>
                  )}
                  {track.release_year && (
                    <span className="text-xs bg-white/10 px-2 py-1 rounded">
                      {track.release_year}
                    </span>
                  )}
                  {track.duration && (
                    <span className="text-xs bg-white/10 px-2 py-1 rounded">
                      {handleDurationFormat(track.duration)}
                    </span>
                  )}
                </div>

                <TrackLikeButton
                  trackId={track.id}
                  liked={true}
                  onToggle={handleToggleLike}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
