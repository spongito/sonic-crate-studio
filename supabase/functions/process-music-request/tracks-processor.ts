
import { getSpotifyToken } from './spotify-client.ts';
import { executeSearchFlow } from './search-flow.ts';
import { calculateConfidenceScore } from './response-utils.ts';
import { generatePlaylistName } from './track-scorer.ts';
import { enrichTracksWithFilters } from './track-enrichment.ts';
import { processRecommendations } from './recommendations-handler.ts';

export async function processTracksRequest(prompt: string, advancedParams: any, platforms: string[], intent: any) {
  let allTracks = [];
  let seedTracks = null;
  let seedArtists = null;
  let spotifyToken = null;

  // Store the original prompt in the intent object for naming
  intent.original_prompt = prompt;

  // Handle Spotify search
  if (platforms.includes('spotify')) {
    try {
      spotifyToken = await getSpotifyToken();
      console.log("Obtained Spotify token successfully");

      const spotifyResults = await executeSearchFlow(intent, spotifyToken, ['spotify']).catch(error => {
        console.error("Spotify search failed:", error);
        return { tracks: [], seedTracks: [], seedArtists: [] };
      });

      if (spotifyResults?.tracks?.length > 0) {
        allTracks = [...allTracks, ...spotifyResults.tracks];
        seedTracks = spotifyResults.seedTracks;
        seedArtists = spotifyResults.seedArtists;
        console.log(`Found ${spotifyResults.tracks.length} tracks through Spotify search`);
      } else {
        console.log("No Spotify tracks found");
      }
    } catch (error) {
      console.error("Spotify processing error:", error);
      console.log("Continuing with other platforms due to Spotify failure");
    }
  }

  // Handle YouTube search
  if (platforms.includes('youtube')) {
    try {
      const youtubeResults = await executeSearchFlow(intent, null, ['youtube']).catch(error => {
        console.error("YouTube search failed:", error);
        return { tracks: [] };
      });

      if (youtubeResults?.tracks?.length > 0) {
        allTracks = [...allTracks, ...youtubeResults.tracks];
        console.log(`Found ${youtubeResults.tracks.length} tracks through YouTube search`);
      } else {
        console.log("No YouTube tracks found");
      }
    } catch (error) {
      console.error("YouTube processing error:", error);
      console.log("Continuing with other platforms due to YouTube failure");
    }
  }

  if (allTracks.length === 0) {
    throw new Error("No tracks found matching your criteria. Try different search terms or platforms.");
  }

  // Get recommendations if we have Spotify data
  const recommendedTracks = await processRecommendations(platforms, spotifyToken, seedTracks, seedArtists, intent);

  // Combine and filter tracks
  const combinedTracks = [...allTracks, ...recommendedTracks];
  if (combinedTracks.length === 0) {
    throw new Error("No tracks could be found or recommended. Please try different search criteria.");
  }

  // Process and enrich tracks
  let processedTracks = await enrichTracksWithFilters(combinedTracks, intent, spotifyToken, platforms);

  return {
    tracks: processedTracks.slice(0, Math.min(50, processedTracks.length)),
    intent: intent,
    created_at: new Date().toISOString(),
    name: generatePlaylistName(intent),
    total_tracks_found: combinedTracks.length,
    recommendation_confidence: calculateConfidenceScore(processedTracks.slice(0, 50)),
    platforms: platforms
  };
}
