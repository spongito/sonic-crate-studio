
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Track } from '@/types/table';
import { useLogger } from '@/hooks/useLogger';
import { transformHistoryTrack, transformMasterTrack } from '@/utils/trackTransformUtils';

export const useTrackFetching = (userId: string | undefined) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const logger = useLogger('useTrackFetching');

  const fetchUserTracks = async () => {
    if (!userId) {
      logger.info('No user logged in, skipping track fetch');
      setIsLoading(false);
      return { allTracks: [], recentTracks: [], likedTracks: [] };
    }

    try {
      setIsLoading(true);
      logger.info('Fetching user tracks');

      // Fetch history tracks
      const { data: historyTracks, error: historyError } = await supabase
        .from("user_track_history")
        .select("*")
        .eq("user_id", userId)
        .order('created_at', { ascending: false });
      
      if (historyError) {
        logger.error('Error loading track history:', historyError);
        throw historyError;
      }

      // Get liked track IDs
      const { data: likedTracksData, error: likedError } = await supabase
        .from("liked_tracks")
        .select("track_id")
        .eq("user_id", userId);

      if (likedError) {
        logger.error('Error loading liked tracks:', likedError);
        throw likedError;
      }

      const likedTrackIdSet = new Set(likedTracksData?.map(item => item.track_id) || []);
      
      // Transform history tracks
      const allTracks: Track[] = historyTracks?.map(track => 
        transformHistoryTrack(track, likedTrackIdSet)
      ) || [];
      
      // Fetch and add master tracks for liked tracks if needed
      if (likedTracksData && likedTracksData.length > 0) {
        const { data: masterTracks, error: masterError } = await supabase
          .from("tracks_master")
          .select("*")
          .in("id", likedTracksData.map(item => item.track_id));

        if (masterError) {
          logger.error('Error loading master tracks:', masterError);
          throw masterError;
        }

        const existingTrackIds = new Set(allTracks.map(t => t.id));

        // Add any master tracks not already in the list
        masterTracks?.forEach(track => {
          if (!existingTrackIds.has(track.id)) {
            allTracks.push(transformMasterTrack(track));
          }
        });
      }

      const likedTracks = allTracks.filter(track => track.liked);
      
      logger.info(`Processed ${allTracks.length} total tracks and ${likedTracks.length} liked tracks`);

      return { 
        allTracks, 
        recentTracks: allTracks.slice(0, 10),
        likedTracks 
      };
    } catch (err) {
      const error = err as Error;
      logger.error('Unexpected error fetching tracks:', error);
      setError(error);
      return { allTracks: [], recentTracks: [], likedTracks: [] };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchUserTracks,
    isLoading,
    error
  };
};

