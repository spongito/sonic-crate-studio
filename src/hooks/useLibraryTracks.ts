
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

interface LibraryTracksResult {
  allTracks: Track[];
  likedTracks: Track[];
  tracksToShow: Track[];
}

// Safe environment checks that work in browser
const isDevelopment = typeof window !== 'undefined' 
  ? window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  : false;

// We can safely check this at runtime since it will be replaced with the actual value during build
const isDebugEnabled = false;

export function useLibraryTracks({ tab, filters }: UseLibraryTracksProps) {
  const { user } = useAuth();
  const logger = useLogger("useLibraryTracks");
  
  const fetchTracks = useCallback(async (): Promise<LibraryTracksResult> => {
    // Use non-process based checks for timing
    if (isDevelopment) {
      console.time('fetchTracks');
    }
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const signal = controller.signal;
    
    // Set timeout of 10 seconds
    const timeoutId = setTimeout(() => {
      controller.abort();
      if (isDevelopment) {
        console.warn('Library tracks fetch timeout after 10s');
      }
    }, 10000);
    
    try {
      if (!user?.id) {
        logger.info('No user logged in, returning empty track list');
        return { allTracks: [], likedTracks: [], tracksToShow: [] };
      }
      
      logger.info(`Fetching tracks for tab: ${tab} with filters:`, filters);
      
      // Fetch liked track IDs first
      const { data: likedTracksData, error: likedError } = await supabase
        .from("liked_tracks")
        .select("track_id")
        .eq("user_id", user.id)
        .abortSignal(signal);

      if (likedError) {
        logger.error('Error loading liked tracks:', likedError);
        throw new Error(`Liked tracks error: ${likedError.message}`);
      }

      const likedTrackIdSet = new Set(likedTracksData?.map(item => item.track_id) || []);
      
      // Fetch history tracks
      const historyQuery = supabase
        .from("user_track_history")
        .select("*")
        .eq("user_id", user.id)
        .order('created_at', { ascending: false })
        .abortSignal(signal);
        
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
      
      // IMPORTANT: Only use explain in development mode with explicit debug flag
      // This was causing the header issue in the production environment
      if (isDevelopment && isDebugEnabled) {
        logger.info('Debug mode: Executing query explain plan');
        const explainQuery = historyQuery.explain({ analyze: true });
        
        try {
          const { data: explainData, error: explainError } = await explainQuery;
          
          if (explainError) {
            console.error('Query explain error:', explainError);
          } else {
            console.log('Query explain plan:', explainData);
          }
        } catch (explainErr) {
          console.error('Error executing explain plan:', explainErr);
        }
      }
      
      // Execute the actual query WITHOUT explain() in production
      const { data: historyTracks, error: historyError } = await historyQuery;
      
      if (historyError) {
        logger.error('Error loading track history:', historyError);
        throw new Error(`History tracks error: ${historyError.message}`);
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
          .in("id", likedTracksData.map(item => item.track_id))
          .abortSignal(signal);

        if (masterError) {
          logger.error('Error loading master tracks:', masterError);
          throw new Error(`Master tracks error: ${masterError.message}`);
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
      if (err.name === 'AbortError') {
        throw new Error('TIMEOUT: Library tracks fetch took too long');
      }
      const error = err as Error;
      logger.error('Error fetching tracks:', error);
      throw error;
    } finally {
      clearTimeout(timeoutId);
      if (isDevelopment) {
        console.timeEnd('fetchTracks');
      }
    }
  }, [user?.id, tab, filters, logger]);

  const queryKey = useMemo(() => ['library-tracks', tab, user?.id, filters], 
    [tab, user?.id, filters]);
  
  const query = useQuery<LibraryTracksResult, Error>({
    queryKey,
    queryFn: fetchTracks,
    placeholderData: (previousData) => previousData,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
    gcTime: 5 * 60 * 1000,
    meta: { requestStartedAt: Date.now() },
    enabled: !!user?.id
  });
  
  return {
    tracks: query.data?.tracksToShow || [],
    allTracks: query.data?.allTracks || [],
    likedTracks: query.data?.likedTracks || [],
    isLoading: query.isLoading,
    isPreviousData: query.isFetching && !!query.data,
    error: query.error
  };
}
