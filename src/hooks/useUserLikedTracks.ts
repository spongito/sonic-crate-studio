
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Required track type
type TrackRow = {
  id: string;
  title: string;
  artist: string[];
  album: string;
  image_url: string | null;
  bpm: number | null;
  key_signature: string | null;
  genre: string[] | null;
  release_year: number | null;
  duration?: number;
  // Additional metadata can go here
};

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
  const query = useQuery({
    queryKey: ["likedTracks", userId, filters],
    queryFn: async () => {
      if (!userId) return [];
      let qb = supabase
        .from("liked_tracks")
        .select(`
            id,
            created_at,
            track:track_id (
              id,
              title,
              artist,
              album,
              image_url,
              bpm,
              key_signature,
              genre,
              release_year
            )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      // In-SQL filtering (for performance on big data)
      if (filters.bpmMin) qb = qb.gte("track.bpm", Number(filters.bpmMin));
      if (filters.bpmMax) qb = qb.lte("track.bpm", Number(filters.bpmMax));
      if (filters.yearMin) qb = qb.gte("track.release_year", Number(filters.yearMin));
      if (filters.yearMax) qb = qb.lte("track.release_year", Number(filters.yearMax));
      if (filters.key) qb = qb.eq("track.key_signature", filters.key);
      if (filters.genre.length) qb = qb.overlaps("track.genre", filters.genre);

      // Text search
      let tracks: any[] = [];
      const { data, error } = await qb;
      if (error) {
        console.error("Error loading liked tracks", error);
        return [];
      }
      if (!data) return [];

      tracks = data.map((row: any) => ({
        ...row.track,
        id: row.track.id,
      }));

      // Client side search by title/artist (fast on < 150 results)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        tracks = tracks.filter((track: TrackRow) =>
          (track.title?.toLowerCase().includes(searchLower) ||
            track.artist?.some((a: string) => a?.toLowerCase().includes(searchLower)))
        );
      }

      return tracks;
    },
  });

  return {
    tracks: query.data || [], // Ensure tracks is always an array
    isLoading: query.isLoading,
    error: query.error,
    ...query
  };
}
