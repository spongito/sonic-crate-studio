
import { useState, useCallback } from 'react';
import { Track } from '@/types/table';
import { useLogger } from '@/hooks/useLogger';
import { useTrackOperations } from '@/hooks/useTrackOperations';

export function useTracksState(userId: string | undefined) {
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [recentTracks, setRecentTracks] = useState<Track[]>([]);
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [refreshAttempts, setRefreshAttempts] = useState<number>(0);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  const logger = useLogger('TracksState');
  const { isLoading, error, fetchUserTracks, toggleLike: toggleTrackLike } = useTrackOperations(userId);

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

  /**
   * Toggle the like status for a track
   * @param trackId The ID of the track to toggle
   * @param isCurrentlyLiked The CURRENT liked state of the track (true = currently liked, false = not currently liked)
   * @returns Promise that resolves when the database operation completes
   */
  const toggleLike = async (trackId: string, isCurrentlyLiked: boolean): Promise<void> => {
    try {
      logger.info(`Toggling like for track ${trackId}, currently liked: ${isCurrentlyLiked}`);
      
      // Pass the current liked state to toggleTrackLike
      await toggleTrackLike(trackId, isCurrentlyLiked);
      
      // The new state is the opposite of the current state
      const newLikedState = !isCurrentlyLiked;
      
      // Update all three track collections to maintain consistency
      setAllTracks(prev => 
        prev.map(track => 
          track.id === trackId ? { ...track, liked: newLikedState } : track
        )
      );
      
      setRecentTracks(prev => 
        prev.map(track => 
          track.id === trackId ? { ...track, liked: newLikedState } : track
        )
      );
      
      if (newLikedState) {
        // If newly liked, add to liked tracks if not already there
        const existingTrack = likedTracks.find(track => track.id === trackId);
        if (!existingTrack) {
          const trackToAdd = allTracks.find(track => track.id === trackId);
          if (trackToAdd) {
            setLikedTracks(prev => [...prev, { ...trackToAdd, liked: true }]);
          }
        }
      } else {
        // If unliked, remove from liked tracks
        setLikedTracks(prev => prev.filter(track => track.id !== trackId));
      }
      
      logger.success(`Track ${trackId} like status toggled to ${newLikedState}`);
    } catch (error) {
      logger.error('Error toggling track like:', error);
      throw error;
    }
  };

  return {
    allTracks,
    recentTracks,
    likedTracks,
    isLoading,
    error,
    refreshTracks,
    toggleLike,
    setAllTracks,
    setRecentTracks,
    setLikedTracks,
    setRefreshAttempts
  };
}
