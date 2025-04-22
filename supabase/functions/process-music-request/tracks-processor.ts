
import { getSpotifyToken, getRecommendations, enrichTracksWithAudioFeatures } from './spotify-client.ts';
import { executeSearchFlow } from './search-flow.ts';
import { calculateConfidenceScore } from './response-utils.ts';
import { generatePlaylistName } from './track-scorer.ts';

export async function processTracksRequest(prompt: string, advancedParams: any, platforms: string[], intent: any) {
  let allTracks = [];
  let seedTracks = null;
  let seedArtists = null;
  let spotifyToken = null;

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

  // Process recommendations if we have Spotify data
  let recommendedTracks = [];
  if (platforms.includes('spotify') && spotifyToken && seedTracks && seedTracks.length > 0) {
    try {
      recommendedTracks = await getRecommendations(seedTracks, seedArtists, intent, spotifyToken).catch(error => {
        console.error("Recommendations failed:", error);
        return [];
      });
      console.log(`Found ${recommendedTracks.length} tracks through recommendations`);
    } catch (error) {
      console.error("Failed to get recommendations:", error);
    }
  }

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

async function enrichTracksWithFilters(tracks: any[], intent: any, spotifyToken: string | null, platforms: string[]) {
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
