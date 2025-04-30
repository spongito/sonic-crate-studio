
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Track } from '@/types/table';
import { useLogger } from '@/hooks/useLogger';
import { formatDuration } from '@/utils/trackUtils';

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

      // Get user's track history - order by created_at descending to get most recent first
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

      // Get user's liked tracks (Join with user_track_history to get full track details)
      const { data: likedTracksJoin, error: likedError } = await supabase
        .from("liked_tracks")
        .select(`
          track_id,
          user_track_history!inner(*)
        `)
        .eq("user_id", userId);

      if (likedError) {
        logger.error('Error loading liked tracks:', likedError);
        setError(likedError);
        return { allTracks: [], recentTracks: [], likedTracks: [] };
      }
      
      // Extract track IDs from the liked tracks response
      const likedTrackIds = new Set(likedTracksJoin.map(lt => lt.track_id));
      
      // Process history tracks and mark liked ones
      const processedTracks = historyTracks.map(track => ({
        ...track,
        id: track.track_id || track.id,
        liked: likedTrackIds.has(track.track_id || track.id),
        created_at: track.created_at,
        duration: formatDuration(track)
      }));

      // Get recent tracks (10 most recent)
      const recentTracks = processedTracks.slice(0, 10);
      
      // Get liked tracks
      const likedTracks = processedTracks.filter(track => track.liked);

      logger.success(`Processed ${processedTracks.length} tracks, ${recentTracks.length} recent, ${likedTracks.length} liked`);
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
      
      // First, we need to find the corresponding record in user_track_history
      const { data: trackData, error: trackError } = await supabase
        .from("user_track_history")
        .select("id")
        .eq("track_id", trackId)
        .maybeSingle();
        
      if (trackError) {
        throw new Error(`Error finding track with ID ${trackId}: ${trackError.message}`);
      }
      
      if (!trackData) {
        throw new Error(`No track found with ID ${trackId}`);
      }

      // Use the internal ID from user_track_history to manipulate liked_tracks
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
