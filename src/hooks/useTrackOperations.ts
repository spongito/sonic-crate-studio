
import { useTrackFetching } from './useTrackFetching';
import { useTrackLikes } from './useTrackLikes';

export const useTrackOperations = (userId: string | undefined) => {
  const { fetchUserTracks, isLoading, error } = useTrackFetching(userId);
  const { toggleLike } = useTrackLikes(userId);

  return {
    isLoading,
    error,
    fetchUserTracks,
    toggleLike
  };
};

