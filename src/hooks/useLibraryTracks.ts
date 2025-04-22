
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useLogger } from "@/hooks/useLogger";
import type { Track } from "@/types/table";
import { useCallback, useMemo } from "react";
import { transformHistoryTrack, transformMasterTrack } from "@/utils/trackTransformUtils";

interface UseLibraryTracksProps {
  tab: string;
  filters?: {
    search?: string;
    bpmRange?: [number, number];
    yearRange?: [number, number];
    genre?: string;
    key?: string;
  };
}

export function useLibraryTracks({ tab, filters }: UseLibraryTracksProps) {
  const { user } = useAuth();
  const logger = useLogger("useLibraryTracks");
  
  const fetchTracks = useCallback(async () => {
    if (!user?.id) {
      logger.info('No user logged in, returning empty track list');
      return { allTracks: [], likedTracks: [] };
    }
    
    logger.info(`Fetching tracks for tab: ${tab} with filters:`, filters);
    
    try {
      // Fetch liked track IDs first
      const { data: likedTracksData, error: likedError } = await supabase
        .from("liked_tracks")
        .select("track_id")
        .eq("user_id", user.id);

      if (likedError) {
        logger.error('Error loading liked tracks:', likedError);
        throw likedError;
      }

      const likedTrackIdSet = new Set(likedTracksData?.map(item => item.track_id) || []);
      
      // Fetch history tracks
      const historyQuery = supabase
        .from("user_track_history")
        .select("*")
        .eq("user_id", user.id)
        .order('created_at', { ascending: false });
        
      // Apply filters if provided
      if (filters?.search) {
        historyQuery.ilike('title', `%${filters.search}%`);
      }
      
      if (filters?.bpmRange) {
        const [min, max] = filters.bpmRange;
        historyQuery.gte('bpm', min).lte('bpm', max);
      }
      
      if (filters?.yearRange && filters.yearRange[0] > 0) {
        const [min, max] = filters.yearRange;
        historyQuery.gte('release_year', min).lte('release_year', max);
      }
      
      if (filters?.genre) {
        historyQuery.ilike('genre', `%${filters.genre}%`);
      }
      
      if (filters?.key) {
        historyQuery.eq('key_signature', filters.key);
      }
      
      const { data: historyTracks, error: historyError } = await historyQuery;
      
      if (historyError) {
        logger.error('Error loading track history:', historyError);
        throw historyError;
      }
      
      // Transform history tracks
      const allTracks: Track[] = historyTracks?.map(track => 
        transformHistoryTrack(track, likedTrackIdSet)
      ) || [];
      
      // Fetch and add master tracks for liked tracks if needed
      if (likedTracksData && likedTracksData.length > 0 && tab === 'liked') {
        const { data: masterTracks, error: masterError } = await supabase
          .from("tracks_master")
          .select("*")
          .in("id", likedTracksData.map(item => item.track_id));

        if (masterError) {
          logger.error('Error loading master tracks:', masterError);
          throw masterError;
        }

        const existingTrackIds = new Set(allTracks.map(t => t.id));

        // Add any master tracks not already in the list
        masterTracks?.forEach(track => {
          if (!existingTrackIds.has(track.id)) {
            allTracks.push(transformMasterTrack(track));
          }
        });
      }

      const likedTracks = allTracks.filter(track => track.liked);
      const tracksToShow = tab === 'liked' ? likedTracks : allTracks;
      
      logger.info(`Loaded ${tracksToShow.length} tracks for tab ${tab}`);
      
      return { 
        allTracks,
        likedTracks,
        tracksToShow
      };
      
    } catch (err) {
      const error = err as Error;
      logger.error('Error fetching tracks:', error);
      throw error;
    }
  }, [user?.id, tab, filters, logger]);

  const queryKey = useMemo(() => ['library-tracks', tab, user?.id, filters], 
    [tab, user?.id, filters]);
  
  const { 
    data, 
    isLoading, 
    error,
    isPreviousData
  } = useQuery({
    queryKey,
    queryFn: fetchTracks,
    keepPreviousData: true,
    staleTime: 1000 * 60, // 1 minute
    enabled: !!user?.id
  });
  
  return {
    tracks: data?.tracksToShow || [],
    allTracks: data?.allTracks || [],
    likedTracks: data?.likedTracks || [],
    isLoading,
    isPreviousData,
    error
  };
}
