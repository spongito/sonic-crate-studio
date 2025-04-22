
import { enrichTracksWithAudioFeatures } from './spotify-client.ts';

export async function enrichTracksWithFilters(tracks: any[], intent: any, spotifyToken: string | null, platforms: string[]) {
  const validTracks = tracks.filter(track => track !== null && track !== undefined);
  
  // Deduplicate tracks
  const uniqueTracks = Array.from(new Map(validTracks.map(track =>
    [track.id || track.spotify_id || track.youtube_id, track]
  )).values());
  console.log(`Combined unique tracks: ${uniqueTracks.length}`);

  // Enrich with audio features if possible
  let tracksWithFeatures = uniqueTracks;
  if (platforms.includes('spotify') && spotifyToken) {
    const spotifyTracks = uniqueTracks.filter(track => track.platform === 'spotify');
    if (spotifyTracks.length > 0) {
      try {
        const enrichedSpotifyTracks = await enrichTracksWithAudioFeatures(spotifyTracks, spotifyToken);
        const nonSpotifyTracks = uniqueTracks.filter(track => track.platform !== 'spotify');
        tracksWithFeatures = [...enrichedSpotifyTracks, ...nonSpotifyTracks];
      } catch (error) {
        console.error("Failed to enrich tracks with audio features:", error);
      }
    }
  }

  // Apply filters
  return applyTrackFilters(tracksWithFeatures, intent);
}

function applyTrackFilters(tracks: any[], intent: any) {
  let filteredTracks = tracks;

  // Apply release year filter if active
  if (intent.release_year_range && intent.activeFilters?.releaseYear) {
    filteredTracks = filteredTracks.filter(track => {
      const year = track.release_year || (track.album?.release_date ? parseInt(track.album.release_date.substring(0, 4)) : null);
      return year ? (year >= intent.release_year_range.min && year <= intent.release_year_range.max) : true;
    });
    console.log(`After release year filtering: ${filteredTracks.length} tracks`);
  }

  // Apply BPM filter if active
  if (intent.bpm_range && intent.activeFilters?.bpm) {
    filteredTracks = filteredTracks.filter(track => {
      const bpm = track.audio_features?.tempo || track.audio_features?.bpm;
      return bpm ? (bpm >= intent.bpm_range.min && bpm <= intent.bpm_range.max) : true;
    });
    console.log(`After BPM filtering: ${filteredTracks.length} tracks`);
  }

  return filteredTracks;
}
