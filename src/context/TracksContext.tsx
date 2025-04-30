
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
  const [refreshAttempts, setRefreshAttempts] = useState<number>(0);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  const { user } = useAuth();
  const logger = useLogger('TracksContext');
  const { isLoading, error, fetchUserTracks, toggleLike: toggleTrackLike } = useTrackOperations(user?.id);

  // Debounced refresh function with retry limit
  const refreshTracks = useCallback(async () => {
    // Prevent refreshing more often than once every 2 seconds
    const now = Date.now();
    if (now - lastRefreshTime < 2000) {
      logger.info('Refresh throttled - skipping');
      return;
    }
    
    // Track this refresh attempt
    setLastRefreshTime(now);
    
    // Limit retry attempts to prevent infinite loops
    if (refreshAttempts >= 3) {
      logger.warning(`Refresh attempts exceeded limit (${refreshAttempts}), skipping refresh`);
      return;
    }

    logger.info('Manually refreshing tracks');
    try {
      const { allTracks: newAllTracks, recentTracks: newRecentTracks, likedTracks: newLikedTracks } = 
        await fetchUserTracks();
      
      setAllTracks(newAllTracks);
      setRecentTracks(newRecentTracks);
      setLikedTracks(newLikedTracks);
      logger.success(`Refreshed tracks: ${newAllTracks.length} total, ${newRecentTracks.length} recent, ${newLikedTracks.length} liked`);
      
      // Reset attempts counter on success
      setRefreshAttempts(0);
    } catch (error) {
      logger.error('Failed to refresh tracks:', error);
      setRefreshAttempts(prev => prev + 1);
    }
  }, [fetchUserTracks, logger, lastRefreshTime, refreshAttempts]);

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
    // Reset attempts when user changes
    setRefreshAttempts(0);
    
    if (user?.id) {
      logger.info('User authenticated, fetching tracks');
      refreshTracks();
    } else {
      logger.info('No user, clearing tracks');
      setAllTracks([]);
      setRecentTracks([]);
      setLikedTracks([]);
    }
    // Only depend on user ID and refreshTracks to prevent excessive refreshing
  }, [user?.id, refreshTracks]);

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
