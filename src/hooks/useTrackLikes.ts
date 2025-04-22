
import { useLogger } from '@/hooks/useLogger';
import { supabase } from '@/integrations/supabase/client';

export const useTrackLikes = (userId: string | undefined) => {
  const logger = useLogger('useTrackLikes');

  const toggleLike = async (trackId: string, liked: boolean) => {
    if (!userId) {
      logger.warning('Cannot toggle like: No user logged in');
      return;
    }

    try {
      logger.info(`Toggling like for track ${trackId}, current state: ${!liked}`);
      
      if (!liked) {
        const { error } = await supabase
          .from("liked_tracks")
          .insert({ user_id: userId, track_id: trackId });
          
        if (error) {
          logger.error('Error adding to liked tracks:', error);
          throw error;
        }
      } else {
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
    toggleLike
  };
};

