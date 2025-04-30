
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Track } from '@/types/table';
import { useLogger } from '@/hooks/useLogger';
import { useTrackOperations } from '@/hooks/useTrackOperations';

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
  const { user } = useAuth();
  const logger = useLogger('TracksContext');
  const { isLoading, error, fetchUserTracks, toggleLike: toggleTrackLike } = useTrackOperations(user?.id);

  const refreshTracks = useCallback(async () => {
    logger.info('Manually refreshing tracks');
    try {
      const { allTracks: newAllTracks, recentTracks: newRecentTracks, likedTracks: newLikedTracks } = 
        await fetchUserTracks();
      
      setAllTracks(newAllTracks);
      setRecentTracks(newRecentTracks);
      setLikedTracks(newLikedTracks);
      logger.success(`Refreshed tracks: ${newAllTracks.length} total, ${newRecentTracks.length} recent, ${newLikedTracks.length} liked`);
    } catch (error) {
      logger.error('Failed to refresh tracks:', error);
    }
  }, [fetchUserTracks, logger]);

  const toggleLike = async (trackId: string, liked: boolean) => {
    try {
      await toggleTrackLike(trackId, liked);
      await refreshTracks();
      logger.success(`Track ${trackId} like status toggled to ${!liked}`);
    } catch (error) {
      logger.error('Error toggling track like:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (user?.id) {
      logger.info('User authenticated, fetching tracks');
      refreshTracks();
    } else {
      logger.info('No user, clearing tracks');
      setAllTracks([]);
      setRecentTracks([]);
      setLikedTracks([]);
    }
  }, [user?.id, refreshTracks, logger]);

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
