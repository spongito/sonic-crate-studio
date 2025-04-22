
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

      // Get user's liked tracks
      const { data: likedTracksData, error: likedError } = await supabase
        .from("liked_tracks")
        .select("track_id")
        .eq("user_id", userId);

      if (likedError) {
        logger.error('Error loading liked tracks:', likedError);
        setError(likedError);
        return { allTracks: [], recentTracks: [], likedTracks: [] };
      }

      logger.info(`Found ${likedTracksData.length} liked tracks`);

      // Create a Set of liked track IDs for easy lookup
      const likedTrackIds = new Set(likedTracksData.map(lt => lt.track_id));

      // Transform history tracks and add liked status
      const processedTracks = historyTracks.map(track => ({
        ...track,
        id: track.track_id,
        liked: likedTrackIds.has(track.track_id),
        created_at: track.created_at,
        duration: formatDuration(track)
      }));

      // Get recent tracks (10 most recent)
      const recentTracks = processedTracks.slice(0, 10);
      
      // Get liked tracks
      const likedTracks = processedTracks.filter(track => track.liked);

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
      logger.info(`Toggling like for track ${trackId}, current state: ${liked}`);
      
      // Important change: Check if the trackId is already a UUID
      // Spotify IDs, YouTube IDs, etc. are not valid UUIDs so we need to handle them differently
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trackId)) {
        // For non-UUID trackIds, we need to query the track's UUID from the tracks_master table
        const { data: trackData, error: trackError } = await supabase
          .from("user_track_history")
          .select("id")
          .eq("track_id", trackId)
          .single();
          
        if (trackError) {
          throw new Error(`Cannot find track with ID ${trackId}: ${trackError.message}`);
        }
        
        if (!trackData) {
          throw new Error(`No track found with ID ${trackId}`);
        }
        
        if (!liked) {
          // Like: Add to liked_tracks using the database UUID, not the external ID
          const { error } = await supabase
            .from("liked_tracks")
            .insert({ user_id: userId, track_id: trackData.id });
            
          if (error) throw error;
        } else {
          // Unlike: Remove from liked_tracks
          const { error } = await supabase
            .from("liked_tracks")
            .delete()
            .eq("user_id", userId)
            .eq("track_id", trackData.id);
            
          if (error) throw error;
        }
      } else {
        // If it's already a valid UUID, use it directly
        if (!liked) {
          // Like: Add to liked_tracks
          const { error } = await supabase
            .from("liked_tracks")
            .insert({ user_id: userId, track_id: trackId });
            
          if (error) throw error;
        } else {
          // Unlike: Remove from liked_tracks
          const { error } = await supabase
            .from("liked_tracks")
            .delete()
            .eq("user_id", userId)
            .eq("track_id", trackId);
            
          if (error) throw error;
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
