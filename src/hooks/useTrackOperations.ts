
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Track } from '@/types/table';
import { useLogger } from '@/hooks/useLogger';
import { formatDuration } from '@/utils/trackUtils';

// Helper function to validate if a string is a valid UUID
const isValidUUID = (str: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export const useTrackOperations = (userId: string | undefined) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const logger = useLogger('useTrackOperations');

  const fetchUserTracks = async () => {
    if (!userId) {
      logger.info('No user logged in, skipping track fetch');
      setIsLoading(false);
      return { allTracks: [], recentTracks: [], likedTracks: [] };
    }

    try {
      setIsLoading(true);
      logger.info('Fetching user tracks');

      // Get user's track history
      const { data: historyTracks, error: historyError } = await supabase
        .from("user_track_history")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (historyError) {
        logger.error('Error loading track history:', historyError);
        setError(historyError);
        return { allTracks: [], recentTracks: [], likedTracks: [] };
      }

      logger.info(`Found ${historyTracks.length} history tracks`);

      // Get user's liked tracks (directly query the liked_tracks table)
      const { data: likedTracksData, error: likedError } = await supabase
        .from("liked_tracks")
        .select("track_id")
        .eq("user_id", userId);

      if (likedError) {
        logger.error('Error loading liked tracks:', likedError);
        setError(likedError);
        return { allTracks: [], recentTracks: [], likedTracks: [] };
      }
      
      // Extract track IDs from the liked tracks response
      const likedTrackIds = new Set(likedTracksData.map(lt => lt.track_id));
      
      // Process history tracks and mark liked ones
      const processedTracks = historyTracks.map(track => ({
        ...track,
        id: track.track_id,
        liked: likedTrackIds.has(track.track_id),
        created_at: track.created_at,
        duration: formatDuration(track)
      }));

      // Get recent tracks (10 most recent)
      const recentTracks = processedTracks.slice(0, 10);
      
      // Match liked tracks with full track information
      const likedTracks = processedTracks.filter(track => 
        likedTrackIds.has(track.track_id)
      );

      return { allTracks: processedTracks, recentTracks, likedTracks };
    } catch (err) {
      const error = err as Error;
      logger.error('Unexpected error fetching tracks:', error);
      setError(error);
      return { allTracks: [], recentTracks: [], likedTracks: [] };
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLike = async (trackId: string, liked: boolean) => {
    if (!userId) {
      logger.warning('Cannot toggle like: No user logged in');
      return;
    }

    try {
      logger.info(`Toggling like for track ${trackId}, current liked state: ${liked}`);
      
      if (!liked) {
        // Like: Add to liked_tracks
        const { error } = await supabase
          .from("liked_tracks")
          .insert({ user_id: userId, track_id: trackId });
          
        if (error) {
          logger.error('Error adding to liked tracks:', error);
          throw error;
        }
      } else {
        // Unlike: Remove from liked_tracks
        const { error } = await supabase
          .from("liked_tracks")
          .delete()
          .eq("user_id", userId)
          .eq("track_id", trackId);
          
        if (error) {
          logger.error('Error removing from liked tracks:', error);
          throw error;
        }
      }
      
      logger.success(`Successfully toggled like for track ${trackId}`);
    } catch (error) {
      logger.error('Error toggling track like:', error);
      throw error;
    }
  };

  return {
    isLoading,
    error,
    fetchUserTracks,
    toggleLike
  };
};
