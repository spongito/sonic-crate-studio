
import type { Track } from "@/types/table";
import type { Track as PlaylistTrack } from "@/components/Playlists/types";

// Helper function to convert playlist track to table track
export const convertPlaylistTracks = (playlistResults: PlaylistTrack[]): Track[] => {
  return playlistResults.map(track => ({
    id: track.spotify_id || track.youtube_id || track.id || '',
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
  }));
};
