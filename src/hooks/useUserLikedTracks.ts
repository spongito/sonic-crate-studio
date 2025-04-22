
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Track } from "@/types/table";
import { useLogger } from "@/hooks/useLogger";

type FilterState = {
  search: string;
  bpmMin: string;
  bpmMax: string;
  yearMin: string;
  yearMax: string;
  genre: string[];
  key: string;
  energy: string[];
  mood: string[];
  camelotMode: boolean;
};

export function useUserLikedTracks({
  filters,
  userId,
}: {
  filters: FilterState;
  userId: string;
}) {
  const queryClient = useQueryClient();
  const logger = useLogger("useUserLikedTracks");

  // Debug logging
  logger.info("Filters updated:", JSON.stringify(filters));

  // Query to fetch both user track history and liked tracks
  const query = useQuery({
    queryKey: ["userTracks", userId, filters],
    queryFn: async () => {
      logger.info("Executing query for user:", userId);
      if (!userId) {
        logger.info("No userId provided");
        return [];
      }

      try {
        // Get user's track history
        const { data: historyTracks, error: historyError } = await supabase
          .from("user_track_history")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (historyError) {
          logger.error("Error loading track history:", historyError);
          return [];
        }

        logger.info(`Found ${historyTracks.length} history tracks`);

        // Get user's liked tracks
        const { data: likedTracksData, error: likedError } = await supabase
          .from("liked_tracks")
          .select("track_id")
          .eq("user_id", userId);

        if (likedError) {
          logger.error("Error loading liked tracks:", likedError);
          return [];
        }

        logger.info(`Found ${likedTracksData.length} liked tracks`);

        // Create a Set of liked track IDs for easy lookup
        const likedTrackIds = new Set(likedTracksData.map(lt => lt.track_id));

        // Transform history tracks and add liked status
        let tracks = historyTracks.map(track => ({
          ...track,
          id: track.track_id,
          liked: likedTrackIds.has(track.track_id),
          // Make sure all necessary fields are passed along
          created_at: track.created_at,
          // Safely handle duration - use a default format if not available
          duration: formatDuration(track)
        }));

        // Apply filters
        tracks = applyFilters(tracks, filters);

        logger.info(`Returning ${tracks.length} tracks after filtering`);
        return tracks;
      } catch (error) {
        logger.error("Unexpected error in useUserLikedTracks query:", error);
        throw error; // Let React Query handle the error
      }
    },
    // Use meta for additional information
    meta: {
      debugInfo: "User liked tracks query" 
    }
  });

  // Helper function to apply filters
  const applyFilters = (tracks: any[], filters: FilterState) => {
    let filteredTracks = [...tracks];
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredTracks = filteredTracks.filter(track =>
        (track.title?.toLowerCase() || "").includes(searchLower) ||
        (track.artist?.toLowerCase() || "").includes(searchLower)
      );
    }

    if (filters.bpmMin) filteredTracks = filteredTracks.filter(t => t.bpm >= Number(filters.bpmMin));
    if (filters.bpmMax) filteredTracks = filteredTracks.filter(t => t.bpm <= Number(filters.bpmMax));
    if (filters.yearMin) filteredTracks = filteredTracks.filter(t => t.release_year >= Number(filters.yearMin));
    if (filters.yearMax) filteredTracks = filteredTracks.filter(t => t.release_year <= Number(filters.yearMax));
    if (filters.key) filteredTracks = filteredTracks.filter(t => t.key_signature === filters.key);
    if (filters.genre.length) filteredTracks = filteredTracks.filter(t => t.genre && filters.genre.includes(t.genre.toString()));
    
    return filteredTracks;
  };

  // Helper function to format duration based on available data
  const formatDuration = (track: any): string => {
    // If track already has a duration string, use it
    if (typeof track.duration === 'string') {
      return track.duration;
    }
    
    // If we have duration in seconds, format it
    if (typeof track.duration_seconds === 'number') {
      const minutes = Math.floor(track.duration_seconds / 60);
      const seconds = Math.floor(track.duration_seconds % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Default duration if nothing is available
    return "0:00";
  };

  // Mutation for toggling track like status
  const toggleLikeMutation = useMutation({
    mutationFn: async ({ trackId, liked }: { trackId: string; liked: boolean }) => {
      logger.info(`Toggle like for track ${trackId}, current state: ${liked}`);
      if (liked) {
        // Unlike: Remove from liked_tracks
        const { error } = await supabase
          .from("liked_tracks")
          .delete()
          .eq("user_id", userId)
          .eq("track_id", trackId);
        if (error) throw error;
      } else {
        // Like: Add to liked_tracks
        const { error } = await supabase
          .from("liked_tracks")
          .insert({ user_id: userId, track_id: trackId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      logger.success("Like toggled successfully, invalidating queries");
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["userTracks", userId] });
    },
    onSettled: (_, error) => {
      if (error) {
        logger.error("Error toggling like:", error);
      }
    }
  });

  return {
    tracks: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    toggleLike: toggleLikeMutation.mutate,
    ...query,
  };
}
