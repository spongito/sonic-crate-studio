
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Track } from "@/types/table";
import { toast } from "sonner";

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
      console.log("useUserLikedTracks: Starting query with userId", userId);
      console.log("useUserLikedTracks: Applied filters", filters);
      
      if (!userId) {
        console.warn("useUserLikedTracks: No userId provided");
        return [];
      }

      // Get user's track history
      console.log("useUserLikedTracks: Fetching track history");
      const { data: historyTracks, error: historyError } = await supabase
        .from("user_track_history")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (historyError) {
        console.error("useUserLikedTracks: Error loading track history:", historyError);
        toast.error("Failed to load track history");
        return [];
      }

      console.log(`useUserLikedTracks: Fetched ${historyTracks?.length || 0} history tracks`);

      // Get user's liked tracks
      console.log("useUserLikedTracks: Fetching liked tracks");
      const { data: likedTracksData, error: likedError } = await supabase
        .from("liked_tracks")
        .select("track_id")
        .eq("user_id", userId);

      if (likedError) {
        console.error("useUserLikedTracks: Error loading liked tracks:", likedError);
        toast.error("Failed to load liked tracks");
        return [];
      }

      console.log(`useUserLikedTracks: Fetched ${likedTracksData?.length || 0} liked tracks`);

      // Create a Set of liked track IDs for easy lookup
      const likedTrackIds = new Set(likedTracksData.map(lt => lt.track_id));
      console.log("useUserLikedTracks: Liked track IDs", Array.from(likedTrackIds).slice(0, 5));

      // Transform history tracks and add liked status
      let tracks = historyTracks.map(track => {
        // Debug specific tracks with missing data
        if (!track.title || !track.artist) {
          console.warn("useUserLikedTracks: Track with missing data", track);
        }
        
        return {
          ...track,
          id: track.track_id,
          liked: likedTrackIds.has(track.track_id),
          // Make sure all necessary fields are passed along
          created_at: track.created_at,
          // Safely handle duration - use a default format if not available
          duration: formatDuration(track)
        };
      });

      console.log("useUserLikedTracks: Tracks after transformation", tracks.length);

      // Apply filters
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const tracksBeforeFilter = tracks.length;
        tracks = tracks.filter(track =>
          (track.title?.toLowerCase() || "").includes(searchLower) ||
          (track.artist?.toLowerCase() || "").includes(searchLower)
        );
        console.log(`useUserLikedTracks: After search filter, tracks: ${tracks.length} (removed ${tracksBeforeFilter - tracks.length})`);
      }

      if (filters.bpmMin) {
        const before = tracks.length;
        tracks = tracks.filter(t => t.bpm >= Number(filters.bpmMin));
        console.log(`useUserLikedTracks: After BPM min filter, tracks: ${tracks.length} (removed ${before - tracks.length})`);
      }
      
      if (filters.bpmMax) {
        const before = tracks.length;
        tracks = tracks.filter(t => t.bpm <= Number(filters.bpmMax));
        console.log(`useUserLikedTracks: After BPM max filter, tracks: ${tracks.length} (removed ${before - tracks.length})`);
      }
      
      if (filters.yearMin) {
        const before = tracks.length;
        tracks = tracks.filter(t => t.release_year >= Number(filters.yearMin));
        console.log(`useUserLikedTracks: After year min filter, tracks: ${tracks.length} (removed ${before - tracks.length})`);
      }
      
      if (filters.yearMax) {
        const before = tracks.length;
        tracks = tracks.filter(t => t.release_year <= Number(filters.yearMax));
        console.log(`useUserLikedTracks: After year max filter, tracks: ${tracks.length} (removed ${before - tracks.length})`);
      }
      
      if (filters.key) {
        const before = tracks.length;
        tracks = tracks.filter(t => t.key_signature === filters.key);
        console.log(`useUserLikedTracks: After key filter, tracks: ${tracks.length} (removed ${before - tracks.length})`);
      }
      
      if (filters.genre.length) {
        const before = tracks.length;
        tracks = tracks.filter(t => t.genre && filters.genre.includes(t.genre.toString()));
        console.log(`useUserLikedTracks: After genre filter, tracks: ${tracks.length} (removed ${before - tracks.length})`);
      }

      console.log("useUserLikedTracks: Final tracks count", tracks.length);
      return tracks;
    },
    onError: (error) => {
      console.error("useUserLikedTracks: Query error:", error);
      toast.error("Failed to load your tracks");
    }
  });

  // Helper function to format duration based on available data
  const formatDuration = (track: any): string => {
    console.log(`Formatting duration for track ${track.id || track.track_id}`);
    
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
    
    // Log if duration is missing
    console.warn(`Missing duration for track: ${track.title} (${track.id || track.track_id})`);
    
    // Default duration if nothing is available
    return "0:00";
  };

  // Mutation for toggling track like status
  const toggleLikeMutation = useMutation({
    mutationFn: async ({ trackId, liked }: { trackId: string; liked: boolean }) => {
      console.log(`useUserLikedTracks: Toggle like for track ${trackId}, current status: ${liked ? 'liked' : 'not liked'}`);
      
      if (liked) {
        // Unlike: Remove from liked_tracks
        console.log("useUserLikedTracks: Removing from liked_tracks");
        const { error } = await supabase
          .from("liked_tracks")
          .delete()
          .eq("user_id", userId)
          .eq("track_id", trackId);
        if (error) {
          console.error("useUserLikedTracks: Error unliking track:", error);
          throw error;
        }
      } else {
        // Like: Add to liked_tracks
        console.log("useUserLikedTracks: Adding to liked_tracks");
        const { error } = await supabase
          .from("liked_tracks")
          .insert({ user_id: userId, track_id: trackId });
        if (error) {
          console.error("useUserLikedTracks: Error liking track:", error);
          throw error;
        }
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch
      console.log(`useUserLikedTracks: Successfully toggled like for track ${variables.trackId}`);
      queryClient.invalidateQueries({ queryKey: ["userTracks", userId] });
    },
    onError: (error) => {
      console.error("useUserLikedTracks: Mutation error:", error);
      toast.error("Failed to update track like status");
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
