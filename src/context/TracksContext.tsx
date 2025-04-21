
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Track } from '@/types/table';
import { useLogger } from '@/hooks/useLogger';

interface TracksContextType {
  allTracks: Track[];
  recentTracks: Track[];
  likedTracks: Track[];
  isLoading: boolean;
  error: Error | null;
  refreshTracks: () => Promise<void>;
  toggleLike: (trackId: string, liked: boolean) => Promise<void>;
}

const TracksContext = createContext<TracksContextType | undefined>(undefined);

export const TracksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [recentTracks, setRecentTracks] = useState<Track[]>([]);
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const logger = useLogger('TracksContext');

  const fetchTracks = async () => {
    if (!user?.id) {
      logger.info('No user logged in, skipping track fetch');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      logger.info('Fetching user tracks');

      // Get user's track history
      const { data: historyTracks, error: historyError } = await supabase
        .from("user_track_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (historyError) {
        logger.error('Error loading track history:', historyError);
        setError(historyError);
        return;
      }

      logger.info(`Found ${historyTracks.length} history tracks`);

      // Get user's liked tracks
      const { data: likedTracksData, error: likedError } = await supabase
        .from("liked_tracks")
        .select("track_id")
        .eq("user_id", user.id);

      if (likedError) {
        logger.error('Error loading liked tracks:', likedError);
        setError(likedError);
        return;
      }

      logger.info(`Found ${likedTracksData.length} liked tracks`);

      // Create a Set of liked track IDs for easy lookup
      const likedTrackIds = new Set(likedTracksData.map(lt => lt.track_id));

      // Transform history tracks and add liked status
      const processedTracks = historyTracks.map(track => ({
        ...track,
        id: track.track_id,
        liked: likedTrackIds.has(track.track_id),
        // Make sure all necessary fields are passed along
        created_at: track.created_at,
        // Safely handle duration - use a default format if not available
        duration: formatDuration(track)
      }));

      setAllTracks(processedTracks);
      
      // Set recent tracks (10 most recent)
      const sortedByDate = [...processedTracks].sort((a, b) => {
        if (!a.created_at) return 1;
        if (!b.created_at) return -1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      setRecentTracks(sortedByDate.slice(0, 10));
      
      // Set liked tracks
      setLikedTracks(processedTracks.filter(track => track.liked));
      
      logger.info('Successfully processed track data');
    } catch (err) {
      const error = err as Error;
      logger.error('Unexpected error fetching tracks:', error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to format duration based on available data
  const formatDuration = (track: any): string => {
    // If track already has a duration string, use it
    if (typeof track.duration === 'string') {
      return track.duration;
    }
    
    // If we have duration in seconds, format it
    if (typeof track.duration_seconds === 'number') {
      const minutes = Math.floor(track.duration_seconds / 60);
      const seconds = Math.floor(track.duration_seconds % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Default duration if nothing is available
    return "0:00";
  };

  const refreshTracks = async () => {
    logger.info('Manually refreshing tracks');
    await fetchTracks();
  };

  const toggleLike = async (trackId: string, liked: boolean) => {
    if (!user?.id) {
      logger.warning('Cannot toggle like: No user logged in');
      return;
    }

    try {
      logger.info(`Toggling like for track ${trackId}, current state: ${liked}`);
      
      if (liked) {
        // Unlike: Remove from liked_tracks
        const { error } = await supabase
          .from("liked_tracks")
          .delete()
          .eq("user_id", user.id)
          .eq("track_id", trackId);
          
        if (error) throw error;
      } else {
        // Like: Add to liked_tracks
        const { error } = await supabase
          .from("liked_tracks")
          .insert({ user_id: user.id, track_id: trackId });
          
        if (error) throw error;
      }

      // Update local state
      setAllTracks(tracks => 
        tracks.map(track => 
          track.id === trackId ? { ...track, liked: !liked } : track
        )
      );
      
      setRecentTracks(tracks => 
        tracks.map(track => 
          track.id === trackId ? { ...track, liked: !liked } : track
        )
      );
      
      // Update liked tracks collection
      if (liked) {
        // Remove from liked tracks
        setLikedTracks(tracks => tracks.filter(track => track.id !== trackId));
      } else {
        // Add to liked tracks
        const trackToAdd = allTracks.find(track => track.id === trackId);
        if (trackToAdd) {
          setLikedTracks(tracks => [...tracks, { ...trackToAdd, liked: true }]);
        }
      }
      
      logger.success(`Successfully toggled like for track ${trackId}`);
    } catch (error) {
      logger.error('Error toggling track like:', error);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, [user?.id]);

  return (
    <TracksContext.Provider
      value={{
        allTracks,
        recentTracks,
        likedTracks,
        isLoading,
        error,
        refreshTracks,
        toggleLike,
      }}
    >
      {children}
    </TracksContext.Provider>
  );
};

export const useTracks = (): TracksContextType => {
  const context = useContext(TracksContext);
  if (context === undefined) {
    throw new Error('useTracks must be used within a TracksProvider');
  }
  return context;
};
