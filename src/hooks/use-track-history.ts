
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type TrackHistoryFilters = {
  search?: string;
  platform?: string[];
  fromDate?: Date;
  toDate?: Date;
  sortBy?: 'created_at' | 'bpm' | 'match_score' | 'release_year';
  sortOrder?: 'asc' | 'desc';
};

export function useTrackHistory(filters: TrackHistoryFilters = {}) {
  const query = useQuery({
    queryKey: ['trackHistory', filters],
    queryFn: async () => {
      let queryBuilder = supabase
        .from('user_track_history')
        .select('*')
        .order(filters.sortBy || 'created_at', { ascending: filters.sortOrder === 'asc' });

      if (filters.search) {
        queryBuilder = queryBuilder.or(`title.ilike.%${filters.search}%,artist.ilike.%${filters.search}%,album.ilike.%${filters.search}%`);
      }

      if (filters.platform?.length) {
        queryBuilder = queryBuilder.in('platform', filters.platform);
      }

      if (filters.fromDate) {
        queryBuilder = queryBuilder.gte('created_at', filters.fromDate.toISOString());
      }

      if (filters.toDate) {
        queryBuilder = queryBuilder.lte('created_at', filters.toDate.toISOString());
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;
      return data || [];
    }
  });

  return {
    tracks: query.data || [],
    isLoading: query.isLoading,
    error: query.error
  };
}
