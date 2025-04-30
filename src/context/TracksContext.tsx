
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Track } from '@/types/table';
import { useLogger } from '@/hooks/useLogger';
import { useTrackOperations } from '@/hooks/useTrackOperations';
import { supabase } from '@/integrations/supabase/client';

interface TracksContextType {
  allTracks: Track[];
  recentTracks: Track[];
  likedTracks: Track[];
  isLoading: boolean;
  error: Error | null;
  refreshTracks: () => Promise<void>;
  toggleLike: (trackId: string, liked: boolean) => Promise<void>;
  isSyncing: boolean;
  syncExistingPlaylists: () => Promise<void>;
}

const TracksContext = createContext<TracksContextType | undefined>(undefined);

export const TracksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [recentTracks, setRecentTracks] = useState<Track[]>([]);
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [refreshAttempts, setRefreshAttempts] = useState<number>(0);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [initialSyncComplete, setInitialSyncComplete] = useState<boolean>(false);
  const { user } = useAuth();
  const logger = useLogger('TracksContext');
  const { isLoading, error, fetchUserTracks, toggleLike: toggleTrackLike } = useTrackOperations(user?.id);

  // Function to sync all tracks from existing playlists to library
  const syncExistingPlaylists = async () => {
    if (!user || isSyncing) return;

    try {
      setIsSyncing(true);
      logger.info('Starting sync of existing playlists to library');

      // Fetch all playlists for the current user
      const { data: playlists, error: playlistsError } = await supabase
        .from("playlists")
        .select("*")
        .eq("user_id", user.id);

      if (playlistsError) {
        logger.error('Error fetching playlists for sync:', playlistsError);
        throw playlistsError;
      }

      if (!playlists || playlists.length === 0) {
        logger.info('No playlists found to sync');
        return;
      }

      logger.info(`Found ${playlists.length} playlists to sync to library`);

      // Process each playlist and extract tracks
      let totalTracks = 0;
      const tracksToInsert = [];

      for (const playlist of playlists) {
        if (!playlist.results || !Array.isArray(playlist.results) || playlist.results.length === 0) {
          continue;
        }

        const playlistTracks = playlist.results as any[];
        logger.info(`Processing ${playlistTracks.length} tracks from playlist "${playlist.name}"`);
        
        // Format tracks for insertion
        const formattedTracks = playlistTracks.map(track => ({
          user_id: user.id,
          track_id: track.id || track.spotify_id || `${track.name}-${track.artist}`,
          title: track.title || track.name || "Unknown Track",
          artist: Array.isArray(track.artist) ? track.artist.join(", ") : track.artist || "Unknown Artist",
          album: track.album || "Unknown Album",
          platform: track.platform || "spotify",
          key_signature: track.key_signature || (track.audio_features ? `${track.audio_features.key} ${track.audio_features.mode === 1 ? 'Major' : 'Minor'}` : null),
          genre: Array.isArray(track.genre) ? track.genre.join(", ") : track.genre || "",
          image_url: track.image_url || track.cover_url || track.image || "",
          external_url: track.external_url || track.platform_url || "",
          bpm: track.bpm || track.audio_features?.bpm || track.audio_features?.tempo,
          release_year: track.release_year
        }));

        tracksToInsert.push(...formattedTracks);
        totalTracks += formattedTracks.length;
      }

      if (tracksToInsert.length === 0) {
        logger.info('No valid tracks found in playlists to sync');
        return;
      }

      // Insert tracks in batches to avoid large payloads
      const batchSize = 50;
      let successCount = 0;

      for (let i = 0; i < tracksToInsert.length; i += batchSize) {
        const batch = tracksToInsert.slice(i, i + batchSize);
        
        const { error: insertError, data } = await supabase
          .from("user_track_history")
          .upsert(batch, {
            onConflict: 'user_id,track_id',
            ignoreDuplicates: false
          });

        if (insertError) {
          logger.error(`Error inserting batch ${i / batchSize + 1}:`, insertError);
        } else {
          successCount += batch.length;
          logger.info(`Successfully processed batch ${i / batchSize + 1} (${batch.length} tracks)`);
        }
      }

      logger.success(`Library sync complete. Synced ${successCount} tracks from ${playlists.length} playlists`);
      
      // Refresh the tracks display
      await refreshTracks();
    } catch (error) {
      logger.error('Error during playlist sync:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Debounced refresh function with retry limit
  const refreshTracks = useCallback(async () => {
    // Prevent refreshing more often than once every 2 seconds
    const now = Date.now();
    if (now - lastRefreshTime < 2000) {
      logger.info('Refresh throttled - skipping');
      return;
    }
    
    // Track this refresh attempt
    setLastRefreshTime(now);
    
    // Limit retry attempts to prevent infinite loops
    if (refreshAttempts >= 3) {
      logger.warning(`Refresh attempts exceeded limit (${refreshAttempts}), skipping refresh`);
      return;
    }

    logger.info('Manually refreshing tracks');
    try {
      const { allTracks: newAllTracks, recentTracks: newRecentTracks, likedTracks: newLikedTracks } = 
        await fetchUserTracks();
      
      setAllTracks(newAllTracks);
      setRecentTracks(newRecentTracks);
      setLikedTracks(newLikedTracks);
      logger.success(`Refreshed tracks: ${newAllTracks.length} total, ${newRecentTracks.length} recent, ${newLikedTracks.length} liked`);
      
      // Reset attempts counter on success
      setRefreshAttempts(0);
    } catch (error) {
      logger.error('Failed to refresh tracks:', error);
      setRefreshAttempts(prev => prev + 1);
    }
  }, [fetchUserTracks, logger, lastRefreshTime, refreshAttempts]);

  const toggleLike = async (trackId: string, liked: boolean) => {
    try {
      await toggleTrackLike(trackId, liked);
      await refreshTracks();
      logger.success(`Track ${trackId} like status toggled to ${!liked}`);
    } catch (error) {
      logger.error('Error toggling track like:', error);
      throw error;
    }
  };

  // Effect to check for empty library and sync if needed
  useEffect(() => {
    const checkAndSyncLibrary = async () => {
      if (user?.id && allTracks.length === 0 && !initialSyncComplete && !isSyncing) {
        // Check if we have any playlists but an empty library
        const { data, error } = await supabase
          .from("playlists")
          .select("id")
          .eq("user_id", user.id)
          .limit(1);
        
        if (!error && data && data.length > 0) {
          logger.info('Found playlists but empty library - performing automatic sync');
          await syncExistingPlaylists();
        }
        
        setInitialSyncComplete(true);
      }
    };
    
    // Only run this if we have a user and the library is empty
    if (user?.id && allTracks.length === 0 && !initialSyncComplete && !isLoading) {
      checkAndSyncLibrary();
    }
  }, [user?.id, allTracks.length, initialSyncComplete, isLoading]);

  useEffect(() => {
    // Reset attempts when user changes
    setRefreshAttempts(0);
    
    if (user?.id) {
      logger.info('User authenticated, fetching tracks');
      refreshTracks();
    } else {
      logger.info('No user, clearing tracks');
      setAllTracks([]);
      setRecentTracks([]);
      setLikedTracks([]);
    }
    // Only depend on user ID and refreshTracks to prevent excessive refreshing
  }, [user?.id, refreshTracks]);

  return (
    <TracksContext.Provider
      value={{
        allTracks,
        recentTracks,
        likedTracks,
        isLoading: isLoading || isSyncing,
        error,
        refreshTracks,
        toggleLike,
        isSyncing,
        syncExistingPlaylists,
      }}
    >
      {children}
    </TracksContext.Provider>
  );
};

export const useTracks = (): TracksContextType => {
  const context = useContext(TracksContext);
  if (context === undefined) {
    throw new Error('useTracks must be used within a TracksProvider');
  }
  return context;
};
