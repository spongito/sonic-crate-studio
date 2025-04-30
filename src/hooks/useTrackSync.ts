
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLogger } from '@/hooks/useLogger';
import { Track } from '@/types/table';

export function useTrackSync(userId: string | undefined) {
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [initialSyncComplete, setInitialSyncComplete] = useState<boolean>(false);
  const logger = useLogger('TrackSync');

  // Function to sync all tracks from existing playlists to library
  const syncExistingPlaylists = async () => {
    if (!userId || isSyncing) return;

    try {
      setIsSyncing(true);
      logger.info('Starting sync of existing playlists to library');

      // Fetch all playlists for the current user
      const { data: playlists, error: playlistsError } = await supabase
        .from("playlists")
        .select("*")
        .eq("user_id", userId);

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
          user_id: userId,
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
        
        const { error: insertError } = await supabase
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
    } catch (error) {
      logger.error('Error during playlist sync:', error);
    } finally {
      setIsSyncing(false);
      setInitialSyncComplete(true);
    }
  };

  const checkAndSyncLibrary = useCallback(async (tracks: Track[]) => {
    if (!userId || initialSyncComplete || isSyncing) return;
    
    if (tracks.length === 0) {
      // Check if we have any playlists but an empty library
      const { data, error } = await supabase
        .from("playlists")
        .select("id")
        .eq("user_id", userId)
        .limit(1);
      
      if (!error && data && data.length > 0) {
        logger.info('Found playlists but empty library - performing automatic sync');
        await syncExistingPlaylists();
      } else {
        setInitialSyncComplete(true);
      }
    } else {
      setInitialSyncComplete(true);
    }
  }, [userId, initialSyncComplete, isSyncing, logger]);

  return {
    isSyncing,
    initialSyncComplete,
    syncExistingPlaylists,
    checkAndSyncLibrary,
    setInitialSyncComplete
  };
}
