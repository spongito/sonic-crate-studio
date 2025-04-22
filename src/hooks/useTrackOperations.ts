
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

      const { data: likedTracksData, error: likedError } = await supabase
        .from("liked_tracks")
        .select(`
          track_id,
          tracks_master (*)
        `)
        .eq("user_id", userId)
        .order('created_at', { ascending: false });

      if (likedError) {
        logger.error('Error loading liked tracks:', likedError);
        throw likedError;
      }

      // Transform the joined data into the expected Track format
      const likedTracks: Track[] = likedTracksData.map(item => {
        const trackMaster = item.tracks_master;
        // Calculate formatted duration if available
        let formattedDuration = trackMaster.duration || "0:00";
        
        if (!formattedDuration && trackMaster.duration_seconds) {
          formattedDuration = formatDuration({ duration_seconds: trackMaster.duration_seconds });
        }
        
        return {
          ...trackMaster,
          duration: formattedDuration,
          liked: true,
          id: item.track_id,
          artist: Array.isArray(trackMaster.artist) ? trackMaster.artist : [trackMaster.artist || ''],
          title: trackMaster.title || '',
          album: trackMaster.album || '',
          platform: trackMaster.platform || '',
          duration_seconds: trackMaster.duration_seconds,
          key_signature: trackMaster.key_signature,
          genre: trackMaster.genre || [],
          release_year: trackMaster.release_year,
          release_date: trackMaster.release_date,
          mood: trackMaster.mood || [],
          language: trackMaster.language,
          label: trackMaster.label,
          is_explicit: trackMaster.is_explicit || false,
          play_count: trackMaster.play_count || 0
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
