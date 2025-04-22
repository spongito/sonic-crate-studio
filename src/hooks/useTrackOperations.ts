
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

      // First, fetch all tracks saved in the user's history
      const { data: historyTracks, error: historyError } = await supabase
        .from("user_track_history")
        .select("*")
        .eq("user_id", userId)
        .order('created_at', { ascending: false });
      
      if (historyError) {
        logger.error('Error loading track history:', historyError);
        throw historyError;
      }

      logger.info(`Found ${historyTracks?.length || 0} tracks in history`);

      // Then, get liked track IDs for this user
      const { data: likedTracksData, error: likedError } = await supabase
        .from("liked_tracks")
        .select("track_id")
        .eq("user_id", userId);

      if (likedError) {
        logger.error('Error loading liked tracks:', likedError);
        throw likedError;
      }

      logger.info(`Found ${likedTracksData?.length || 0} liked tracks`);

      // Create a Set of liked track IDs for easy lookup
      const likedTrackIdSet = new Set(likedTracksData?.map(item => item.track_id) || []);
      
      // Transform history tracks into the Track format and mark liked tracks
      const allTracks: Track[] = historyTracks?.map(historyTrack => {
        const track = historyTrack as any; // Use any temporarily for type safety
        
        // Calculate formatted duration
        let formattedDuration = "0:00";
        if (track.duration_seconds) {
          formattedDuration = formatDuration({ 
            duration_seconds: typeof track.duration_seconds === 'string' 
              ? parseFloat(track.duration_seconds) 
              : track.duration_seconds 
          });
        }
        
        return {
          id: track.track_id || track.id,
          title: track.title || '',
          artist: Array.isArray(track.artist) ? track.artist : [track.artist || ''],
          album: track.album || '',
          platform: track.platform || '',
          bpm: track.bpm || null,
          key_signature: track.key_signature || undefined,
          image_url: track.image_url || undefined,
          genre: track.genre ? (Array.isArray(track.genre) ? track.genre : [track.genre]) : [],
          liked: likedTrackIdSet.has(track.track_id || track.id),
          duration: formattedDuration,
          duration_seconds: track.duration_seconds,
          created_at: track.created_at
        };
      }) || [];
      
      // Also fetch the full master track data for liked tracks if they weren't in history
      if (likedTracksData && likedTracksData.length > 0) {
        // Fetch full track details from tracks_master for liked tracks
        const { data: masterTracks, error: masterError } = await supabase
          .from("tracks_master")
          .select("*")
          .in("id", likedTracksData.map(item => item.track_id));

        if (masterError) {
          logger.error('Error loading master tracks:', masterError);
          throw masterError;
        }

        // Create a map of track IDs we already have from history
        const existingTrackIds = new Set(allTracks.map(t => t.id));

        // Add any master tracks that aren't already in our list
        masterTracks?.forEach(masterTrack => {
          const track = masterTrack as any; // Use any temporarily for safer access
          
          if (!existingTrackIds.has(track.id)) {
            // Calculate formatted duration
            let formattedDuration = "0:00";
            if (track.duration_seconds) {
              formattedDuration = formatDuration({ 
                duration_seconds: typeof track.duration_seconds === 'string' 
                  ? parseFloat(track.duration_seconds) 
                  : track.duration_seconds 
              });
            } else if (track.duration) {
              formattedDuration = track.duration;
            }
            
            allTracks.push({
              id: track.id,
              title: track.title || '',
              artist: Array.isArray(track.artist) ? track.artist : [track.artist || ''],
              album: track.album || '',
              platform: track.platform || '',
              duration: formattedDuration,
              duration_seconds: track.duration_seconds,
              bpm: track.bpm || null,
              genre: track.genre || [],
              key_signature: track.key_signature,
              release_year: track.release_year,
              image_url: track.image_url,
              liked: true, // These are from liked_tracks so they're definitely liked
              mood: track.mood,
              language: track.language,
              label: track.label,
              is_explicit: track.is_explicit,
              play_count: track.play_count
            });
          }
        });
      }

      // Get the liked tracks by filtering allTracks
      const likedTracks = allTracks.filter(track => track.liked);
      
      logger.info(`Processed ${allTracks.length} total tracks and ${likedTracks.length} liked tracks`);

      return { 
        allTracks, 
        recentTracks: allTracks.slice(0, 10), // Just take the 10 most recent tracks
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
      logger.info(`Toggling like for track ${trackId}, current state: ${!liked}`);
      
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
