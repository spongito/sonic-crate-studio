
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

      // Get liked tracks with full track information from tracks_master
      const { data: likedTracksData, error: likedError } = await supabase
        .from('liked_tracks')
        .select(`
          track_id,
          tracks_master (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (likedError) {
        logger.error('Error loading liked tracks:', likedError);
        throw likedError;
      }

      // Transform the joined data into the expected Track format
      // Ensuring all required fields are present
      const likedTracks: Track[] = likedTracksData.map(item => {
        // Calculate formatted duration if available, otherwise use default format
        let formattedDuration = "0:00";
        
        if (item.tracks_master.duration_seconds) {
          formattedDuration = formatDuration({ duration_seconds: item.tracks_master.duration_seconds });
        }
        
        return {
          ...item.tracks_master,
          // Ensure required properties from Track interface are present
          duration: formattedDuration,
          liked: true,
          id: item.track_id,
          artist: item.tracks_master.artist || '',
          title: item.tracks_master.title || '',
          album: item.tracks_master.album || '',
          platform: item.tracks_master.platform || ''
        } as Track;
      });

      logger.info(`Found ${likedTracks.length} liked tracks`);
      
      return { 
        allTracks: likedTracks, 
        recentTracks: likedTracks.slice(0, 10), 
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
