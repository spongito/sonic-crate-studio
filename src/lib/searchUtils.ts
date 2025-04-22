
/**
 * Seed and deduplication utilities for playlist/search flows
 */

// Extract top seed tracks based on popularity/id
export function getSeedTracks(tracks: any[], count: number) {
  if (!tracks || tracks.length === 0) return [];
  const filteredTracks = tracks.filter(track => track && track.id);
  if (filteredTracks.length === 0) return [];
  const sortedTracks = [...filteredTracks].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  return sortedTracks.slice(0, count).map(track => track.id);
}

// Deduplicate based on id/youtube_id/spotify_id
export function combineAndDeduplicateTracks(trackArrays: any[]) {
  const uniqueTracks = new Map();
  const flatTracks = Array.isArray(trackArrays[0]) ? trackArrays.flat() : trackArrays;
  for (const track of flatTracks) {
    if (!track) continue;
    const trackId = track.id || track.youtube_id || track.spotify_id;
    if (!uniqueTracks.has(trackId)) {
      uniqueTracks.set(trackId, track);
    }
  }
  return Array.from(uniqueTracks.values());
}
