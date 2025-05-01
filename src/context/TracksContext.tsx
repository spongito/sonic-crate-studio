
import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Track } from '@/types/table';
import { useLogger } from '@/hooks/useLogger';
import { useTracksState } from '@/hooks/useTracksState';
import { useTrackSync } from '@/hooks/useTrackSync';
import { toast } from 'sonner';

interface TracksContextType {
  allTracks: Track[];
  recentTracks: Track[];
  likedTracks: Track[];
  isLoading: boolean;
  error: Error | null;
  refreshTracks: () => Promise<void>;
  toggleLike: (trackId: string, isCurrentlyLiked: boolean) => Promise<void>;
  isSyncing: boolean;
  syncExistingPlaylists: () => Promise<void>;
  getUserLikedTrackIds: () => Promise<string[]>;
}

const TracksContext = createContext<TracksContextType | undefined>(undefined);

export const TracksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const logger = useLogger('TracksContext');
  
  const {
    allTracks,
    recentTracks,
    likedTracks,
    isLoading,
    error,
    refreshTracks,
    toggleLike: toggleTrackLike,
    setRefreshAttempts
  } = useTracksState(user?.id);
  
  const {
    isSyncing,
    syncExistingPlaylists,
    checkAndSyncLibrary
  } = useTrackSync(user?.id);

  // Get a list of all liked track IDs from the liked tracks array
  const getUserLikedTrackIds = useCallback(async (): Promise<string[]> => {
    if (!user?.id) {
      logger.warning('getUserLikedTrackIds called but no user is logged in');
      return [];
    }
    
    // Return track IDs from the likedTracks array for performance
    // This is faster than fetching from database every time
    const trackIds = likedTracks.map(track => track.id);
    logger.debug(`Returning ${trackIds.length} liked track IDs for user ${user.id}`);
    return trackIds;
  }, [user?.id, likedTracks, logger]);

  // Enhanced toggleLike with better error handling and feedback
  const toggleLike = useCallback(async (trackId: string, isCurrentlyLiked: boolean): Promise<void> => {
    if (!user?.id) {
      logger.warning('Cannot toggle like: No user logged in');
      toast.error('Please sign in to save tracks');
      throw new Error('User not logged in');
    }

    try {
      logger.info(`Toggling like for track ${trackId}, currently liked: ${isCurrentlyLiked}`);
      await toggleTrackLike(trackId, isCurrentlyLiked);
      
      // No need for toast here as it's handled by the components
    } catch (error) {
      logger.error('Error in toggleLike:', error);
      toast.error('Failed to update track');
      throw error; // Re-throw to let component handle it
    }
  }, [user?.id, toggleTrackLike, logger]);

  // Effect to check for empty library and sync if needed
  useEffect(() => {
    if (user?.id && !isLoading) {
      checkAndSyncLibrary(allTracks);
    }
  }, [user?.id, allTracks.length, isLoading, checkAndSyncLibrary]);

  useEffect(() => {
    // Reset attempts when user changes
    setRefreshAttempts(0);
    
    if (user?.id) {
      logger.info('User authenticated, fetching tracks');
      refreshTracks();
    } else {
      logger.info('No user, clearing tracks');
    }
    // Only depend on user ID and refreshTracks to prevent excessive refreshing
  }, [user?.id, refreshTracks, setRefreshAttempts, logger]);

  return (
    <TracksContext.Provider
      value={{
        allTracks,
        recentTracks,
        likedTracks,
        isLoading: isLoading || isSyncing,
        error,
        refreshTracks,
        toggleLike,
        isSyncing,
        syncExistingPlaylists,
        getUserLikedTrackIds
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
