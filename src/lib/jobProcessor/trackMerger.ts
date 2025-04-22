
import { Track, GeneratedTrack } from '@/types/table';

// Configuration for debugging
const LOG_DEBUG = process.env.NODE_ENV === 'development';

/**
 * Merges and deduplicates tracks from different sources, preferring Spotify metadata
 * @param spotifyTracks - Array of tracks from Spotify API
 * @param youtubeTracks - Array of tracks from YouTube API
 * @returns Combined and deduplicated array of tracks
 */
export function mergeAndDedupeTracks(
  spotifyTracks: any[] = [],
  youtubeTracks: any[] = []
): GeneratedTrack[] {
  if (LOG_DEBUG) console.log(`Merging ${spotifyTracks.length} Spotify tracks and ${youtubeTracks.length} YouTube tracks`);
  
  // Use a Map to deduplicate by external ID
  const tracksMap = new Map<string, GeneratedTrack>();
  
  // First add all Spotify tracks to the map
  for (const track of spotifyTracks) {
    if (!track || !track.id) continue;
    
    const externalId = track.spotify_id || track.id;
    tracksMap.set(externalId, {
      ...track,
      platform: 'spotify',
      source: 'spotify'
    });
  }
  
  // Then add YouTube tracks that don't already exist
  for (const track of youtubeTracks) {
    if (!track || !track.id) continue;
    
    const youtubeId = track.youtube_id || track.id;
    // Check if we already have this track from Spotify
    // In a real app, we might use more sophisticated matching here
    const possibleTitle = track.title?.toLowerCase();
    let isDuplicate = false;
    
    // Basic title-based deduplication (could be improved)
    if (possibleTitle) {
      for (const [, existingTrack] of tracksMap) {
        if (existingTrack.title?.toLowerCase() === possibleTitle) {
          isDuplicate = true;
          break;
        }
      }
    }
    
    if (!isDuplicate) {
      tracksMap.set(youtubeId, {
        ...track,
        platform: 'youtube',
        source: 'youtube_audio'
      });
    }
  }
  
  if (LOG_DEBUG) console.log(`After deduplication: ${tracksMap.size} unique tracks`);
  
  return Array.from(tracksMap.values());
}

/**
 * Calculate a score for each track based on audio features
 * @param tracks - Array of tracks with audio features
 * @returns The same tracks with a score property added
 */
export function scoreAndSortTracks(tracks: GeneratedTrack[]): GeneratedTrack[] {
  if (LOG_DEBUG) console.log(`Scoring ${tracks.length} tracks`);
  
  const scoredTracks = tracks.map(track => {
    let score = 50; // Default base score
    
    // Access audio features, which might be in different locations
    const audioFeatures = track.audio_features || {};
    
    // Calculate score based on audio features if available
    if (audioFeatures) {
      const danceability = audioFeatures.danceability || 0;
      const energy = audioFeatures.energy || 0;
      const valence = audioFeatures.valence || 0;
      const speechiness = audioFeatures.speechiness || 0;
      
      score = (danceability * 40) + (energy * 30) + (valence * 20) - (speechiness * 10);
      
      // Ensure score is in a reasonable range (0-100)
      score = Math.max(0, Math.min(100, score));
    }
    
    // Add score to track
    return {
      ...track,
      score
    };
  });
  
  // Sort by score descending
  return scoredTracks.sort((a, b) => (b.score || 0) - (a.score || 0));
}

/**
 * Create batches of items from an array
 * @param items - Array to be batched
 * @param batchSize - Size of each batch
 * @returns Array of batches
 */
export function createBatches<T>(items: T[], batchSize: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  return batches;
}
