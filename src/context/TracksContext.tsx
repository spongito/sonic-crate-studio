
import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Track } from '@/types/table';
import { useLogger } from '@/hooks/useLogger';
import { useTracksState } from '@/hooks/useTracksState';
import { useTrackSync } from '@/hooks/useTrackSync';

interface TracksContextType {
  allTracks: Track[];
  recentTracks: Track[];
  likedTracks: Track[];
  isLoading: boolean;
  error: Error | null;
  refreshTracks: () => Promise<void>;
  toggleLike: (trackId: string, liked: boolean) => Promise<void>;
  isSyncing: boolean;
  syncExistingPlaylists: () => Promise<void>;
}

// Create a default context value for unauthenticated users
const defaultContextValue: TracksContextType = {
  allTracks: [],
  recentTracks: [],
  likedTracks: [],
  isLoading: false,
  error: null,
  refreshTracks: async () => {
    console.log("Track refresh not available for unauthenticated users");
  },
  toggleLike: async () => {
    console.log("Like functionality requires authentication");
    throw new Error("Authentication required to like tracks");
  },
  isSyncing: false,
  syncExistingPlaylists: async () => {
    console.log("Playlist sync not available for unauthenticated users");
  }
};

const TracksContext = createContext<TracksContextType>(defaultContextValue);

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
    toggleLike,
    setRefreshAttempts
  } = useTracksState(user?.id);
  
  const {
    isSyncing,
    syncExistingPlaylists,
    checkAndSyncLibrary
  } = useTrackSync(user?.id);

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
      logger.info('No user, providing default context');
    }
    // Only depend on user ID and refreshTracks to prevent excessive refreshing
  }, [user?.id, refreshTracks, setRefreshAttempts, logger]);

  // Provide actual implementation when authenticated, fallback otherwise
  const contextValue = user ? {
    allTracks,
    recentTracks,
    likedTracks,
    isLoading: isLoading || isSyncing,
    error,
    refreshTracks,
    toggleLike,
    isSyncing,
    syncExistingPlaylists,
  } : defaultContextValue;

  return (
    <TracksContext.Provider value={contextValue}>
      {children}
    </TracksContext.Provider>
  );
};

export const useTracks = (): TracksContextType => {
  const context = useContext(TracksContext);
  return context; // No need to check for undefined since we always provide a default value
};
