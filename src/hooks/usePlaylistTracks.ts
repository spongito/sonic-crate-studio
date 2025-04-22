
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Track } from "@/types/table";
import type { Track as PlaylistTrack } from "@/components/Playlists/types";

// Helper function to convert between track types
const convertPlaylistTrackToTableTrack = (track: PlaylistTrack): Track => {
  return {
    id: track.spotify_id || track.youtube_id || '',
    title: track.title,
    artist: Array.isArray(track.artist) ? track.artist : [track.artist],
    album: track.album || '',
    platform: track.platform || 'spotify',
    image_url: track.cover_url || '',
    bpm: track.audio_features?.bpm || null,
    key_signature: track.key_signature || undefined,
    genre: track.genre || null,
    release_year: track.release_year,
    duration: track.duration || '',
    platform_url: track.platform_url || track.external_url || '',
  };
};

export const usePlaylistTracks = (playlistId: string, initialTracks: PlaylistTrack[]) => {
  const [tracks, setTracks] = useState<Track[]>(
    initialTracks ? initialTracks.map(convertPlaylistTrackToTableTrack) : []
  );

  const updateTrackPositions = async () => {
    try {
      const trackUpdates = tracks.map((track, index) => ({
        track_id: track.id,
        position: index,
        playlist_id: playlistId
      }));

      const { error: trackError } = await supabase
        .from('playlist_tracks')
        .upsert(trackUpdates, { 
          onConflict: 'track_id,playlist_id'
        });

      if (trackError) throw trackError;
      return true;
    } catch (error) {
      console.error('Error updating track positions:', error);
      return false;
    }
  };

  const removeTracks = async (tracksToRemove: string[]) => {
    try {
      const { error } = await supabase
        .from('playlist_tracks')
        .delete()
        .eq('playlist_id', playlistId)
        .in('track_id', tracksToRemove);

      if (error) throw error;

      setTracks(tracks.filter(track => !tracksToRemove.includes(track.id)));
      toast.success(`Removed ${tracksToRemove.length} track(s)`);
      return true;
    } catch (error) {
      console.error('Error removing tracks:', error);
      toast.error('Failed to remove tracks');
      return false;
    }
  };

  return {
    tracks,
    setTracks,
    updateTrackPositions,
    removeTracks
  };
};
