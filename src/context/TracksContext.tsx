
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Track } from '@/types/table';
import { useLogger } from '@/hooks/useLogger';
import { useTrackOperations } from '@/hooks/useTrackOperations';
import { toast } from '@/components/ui/use-toast';

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
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshTracks = useCallback(async () => {
    if (!user?.id) {
      logger.info('No user logged in, skipping refresh');
      return;
    }
    
    logger.info('Refreshing tracks data');
    setIsRefreshing(true);
    
    try {
      const { allTracks: newAllTracks, recentTracks: newRecentTracks, likedTracks: newLikedTracks } = 
        await fetchUserTracks();
      
      logger.info(`Retrieved ${newAllTracks.length} total tracks, ${newLikedTracks.length} liked tracks`);
      
      setAllTracks(newAllTracks);
      setRecentTracks(newRecentTracks);
      setLikedTracks(newLikedTracks);
    } catch (err) {
      logger.error('Error refreshing tracks:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to refresh tracks",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [user?.id, fetchUserTracks, logger]);

  const toggleLike = useCallback(async (trackId: string, liked: boolean) => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to like tracks",
      });
      return;
    }
    
    try {
      await toggleTrackLike(trackId, liked);
      
      // Update local state to reflect the change
      const updatedAllTracks = allTracks.map(track => 
        track.id === trackId ? { ...track, liked: !liked } : track
      );
      
      setAllTracks(updatedAllTracks);
      
      // Update likedTracks
      if (liked) {
        // Remove from liked tracks
        setLikedTracks(prev => prev.filter(track => track.id !== trackId));
      } else {
        // Add to liked tracks
        const trackToAdd = allTracks.find(track => track.id === trackId);
        if (trackToAdd) {
          setLikedTracks(prev => [{ ...trackToAdd, liked: true }, ...prev]);
        }
      }
      
      logger.success(`Successfully toggled like for track ${trackId}`);
    } catch (err) {
      logger.error('Error toggling track like:', err);
      throw err;
    }
  }, [allTracks, toggleTrackLike, user?.id, logger]);

  // Initial fetch when user changes
  useEffect(() => {
    refreshTracks();
  }, [user?.id, refreshTracks]);

  return (
    <TracksContext.Provider
      value={{
        allTracks,
        recentTracks,
        likedTracks,
        isLoading: isLoading || isRefreshing,
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
