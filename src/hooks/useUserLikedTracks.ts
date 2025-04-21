
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Track } from "@/types/table";

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

  // Query to fetch both user track history and liked tracks
  const query = useQuery({
    queryKey: ["userTracks", userId, filters],
    queryFn: async () => {
      if (!userId) return [];

      // Get user's track history
      const { data: historyTracks, error: historyError } = await supabase
        .from("user_track_history")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (historyError) {
        console.error("Error loading track history:", historyError);
        return [];
      }

      // Get user's liked tracks
      const { data: likedTracksData, error: likedError } = await supabase
        .from("liked_tracks")
        .select("track_id")
        .eq("user_id", userId);

      if (likedError) {
        console.error("Error loading liked tracks:", likedError);
        return [];
      }

      // Create a Set of liked track IDs for easy lookup
      const likedTrackIds = new Set(likedTracksData.map(lt => lt.track_id));

      // Transform history tracks and add liked status
      let tracks = historyTracks.map(track => ({
        ...track,
        id: track.track_id,
        liked: likedTrackIds.has(track.track_id),
        duration: track.duration || formatDurationFromSeconds(track.duration_seconds) || "0:00"
      }));

      // Apply filters
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        tracks = tracks.filter(track =>
          track.title?.toLowerCase().includes(searchLower) ||
          track.artist?.toLowerCase().includes(searchLower)
        );
      }

      if (filters.bpmMin) tracks = tracks.filter(t => t.bpm >= Number(filters.bpmMin));
      if (filters.bpmMax) tracks = tracks.filter(t => t.bpm <= Number(filters.bpmMax));
      if (filters.yearMin) tracks = tracks.filter(t => t.release_year >= Number(filters.yearMin));
      if (filters.yearMax) tracks = tracks.filter(t => t.release_year <= Number(filters.yearMax));
      if (filters.key) tracks = tracks.filter(t => t.key_signature === filters.key);
      if (filters.genre.length) tracks = tracks.filter(t => t.genre && filters.genre.includes(t.genre));

      return tracks;
    },
  });

  // Helper function to format duration
  const formatDurationFromSeconds = (seconds?: number): string | undefined => {
    if (!seconds) return undefined;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Mutation for toggling track like status
  const toggleLikeMutation = useMutation({
    mutationFn: async ({ trackId, liked }: { trackId: string; liked: boolean }) => {
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
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["userTracks", userId] });
    },
  });

  return {
    tracks: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    toggleLike: toggleLikeMutation.mutate,
    ...query,
  };
}
