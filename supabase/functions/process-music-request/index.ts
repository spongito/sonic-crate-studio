
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from './cors.ts';
import { createStructuredIntent } from './intent-analyzer.ts';
import { getSpotifyToken } from './spotify-client.ts';
import { executeSearchFlow } from './search-flow.ts';
import { scoreTracksBasedOnIntent, generatePlaylistName } from './track-scorer.ts';

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Input validation
    if (!req.body) {
      throw new Error("Request body is required");
    }

    const { prompt, advancedParams, platforms = ['spotify', 'youtube'] } = await req.json();
    
    if (!prompt || typeof prompt !== 'string') {
      throw new Error("A valid text prompt is required");
    }
    
    if (!Array.isArray(platforms) || platforms.length === 0) {
      throw new Error("At least one platform must be selected");
    }
    
    console.log("Request received:", { prompt, advancedParams, platforms });
    
    // Validate API keys for selected platforms
    if (platforms.includes('youtube') && !Deno.env.get('YOUTUBE_API_KEY')) {
      console.warn("YouTube API key is not configured");
      // Don't throw here, we'll handle it later based on other platforms
    }
    
    // Intent Analysis
    const intent = await createStructuredIntent(prompt, advancedParams).catch(error => {
      console.error("Intent analysis failed:", error);
      throw new Error("Failed to analyze music request: " + error.message);
    });
    console.log("Created structured intent:", JSON.stringify(intent, null, 2));
    
    // Process additional advanced parameters
    if (advancedParams?.releaseYearRange && Array.isArray(advancedParams.releaseYearRange) && advancedParams.releaseYearRange.length === 2) {
      intent.release_year_range = {
        min: advancedParams.releaseYearRange[0],
        max: advancedParams.releaseYearRange[1]
      };
    }
    
    if (advancedParams?.useBpmFilter && advancedParams?.bpmRange && Array.isArray(advancedParams.bpmRange) && advancedParams.bpmRange.length === 2) {
      intent.bpm_range = {
        min: advancedParams.bpmRange[0],
        max: advancedParams.bpmRange[1]
      };
    }
    
    if (advancedParams?.locations && Array.isArray(advancedParams.locations) && advancedParams.locations.length > 0) {
      intent.market = advancedParams.locations[0];
    }
    
    // Add reference tracks if provided
    if (advancedParams?.referenceTrackIds && Array.isArray(advancedParams.referenceTrackIds) && advancedParams.referenceTrackIds.length > 0) {
      intent.reference_track_ids = advancedParams.referenceTrackIds;
    }
    
    // Add reference artists if provided (either from structured intent or directly)
    if (advancedParams?.referenceArtistIds && Array.isArray(advancedParams.referenceArtistIds) && advancedParams.referenceArtistIds.length > 0) {
      intent.reference_artist_ids = advancedParams.referenceArtistIds;
    }
    
    // Initialize empty arrays for tracks
    let allTracks = [];
    let seedTracks = null;
    let seedArtists = null;
    let spotifyToken = null;
    
    // Spotify functionality - only try if selected
    if (platforms.includes('spotify')) {
      try {
        // Attempt to get Spotify token
        spotifyToken = await getSpotifyToken();
        console.log("Obtained Spotify token successfully");
        
        // Attempt Spotify search
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
        // Don't throw, we'll continue with other platforms
      }
    }
    
    // YouTube functionality - only try if selected
    if (platforms.includes('youtube')) {
      try {
        // Validate YouTube API key
        if (!Deno.env.get('YOUTUBE_API_KEY')) {
          throw new Error("YouTube API key is not configured");
        }
        
        // Attempt YouTube search
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
        // Don't throw, we'll continue with other platforms
      }
    }
    
    // Validate we found at least some tracks
    if (allTracks.length === 0) {
      throw new Error("No tracks found matching your criteria. Try different search terms or platforms.");
    }
    
    // Recommendations (only for Spotify if we have seedTracks)
    let recommendedTracks = [];
    if (platforms.includes('spotify') && spotifyToken && seedTracks && seedTracks.length > 0) {
      try {
        const { getRecommendations } = await import('./spotify-recommendations.ts');
        recommendedTracks = await getRecommendations(seedTracks, seedArtists, intent, spotifyToken).catch(error => {
          console.error("Recommendations failed:", error);
          // Don't throw here, we can continue with search results only
          return [];
        });
        console.log(`Found ${recommendedTracks.length} tracks through recommendations`);
      } catch (error) {
        console.error("Failed to get recommendations:", error);
        // Continue without recommendations
      }
    }
    
    // Combine and deduplicate tracks
    const combinedTracks = [...allTracks, ...recommendedTracks];
    if (combinedTracks.length === 0) {
      throw new Error("No tracks could be found or recommended. Please try different search criteria.");
    }
    
    // Filter out null tracks and deduplicate
    const validTracks = combinedTracks.filter(track => track !== null && track !== undefined);
    
    const uniqueTracks = Array.from(new Map(validTracks.map(track => 
      [track.id || track.spotify_id || track.youtube_id, track]
    )).values());
    console.log(`Combined unique tracks: ${uniqueTracks.length}`);
    
    // Enrich with audio features and score tracks
    console.log("Enriching tracks with audio features...");
    let tracksWithFeatures = uniqueTracks;
    
    // Only enrich Spotify tracks with audio features
    if (platforms.includes('spotify') && spotifyToken) {
      const spotifyTracks = uniqueTracks.filter(track => track.platform === 'spotify');
      if (spotifyTracks.length > 0) {
        try {
          const { enrichTracksWithAudioFeatures } = await import('./spotify-track-utils.ts');
          const enrichedSpotifyTracks = await enrichTracksWithAudioFeatures(spotifyTracks, spotifyToken).catch(error => {
            console.error("Audio features enrichment failed:", error);
            // Continue without audio features if needed
            return spotifyTracks;
          });
          
          // Replace Spotify tracks with enriched versions
          const nonSpotifyTracks = uniqueTracks.filter(track => track.platform !== 'spotify');
          tracksWithFeatures = [...enrichedSpotifyTracks, ...nonSpotifyTracks];
        } catch (error) {
          console.error("Failed to import spotify-track-utils:", error);
          // Continue with original tracks
        }
      }
    }
    
    // Filter by release year if specified
    if (intent.release_year_range) {
      tracksWithFeatures = tracksWithFeatures.filter(track => {
        const year = track.release_year || (track.album?.release_date ? parseInt(track.album.release_date.substring(0, 4)) : null);
        return year ? (year >= intent.release_year_range.min && year <= intent.release_year_range.max) : true;
      });
      console.log(`After release year filtering: ${tracksWithFeatures.length} tracks`);
    }
    
    // Filter by BPM if specified and if we have BPM data
    if (intent.bpm_range) {
      tracksWithFeatures = tracksWithFeatures.filter(track => {
        const bpm = track.audio_features?.tempo || track.audio_features?.bpm;
        return bpm ? (bpm >= intent.bpm_range.min && bpm <= intent.bpm_range.max) : true;
      });
      console.log(`After BPM filtering: ${tracksWithFeatures.length} tracks`);
    }
    
    const scoredTracks = scoreTracksBasedOnIntent(tracksWithFeatures, intent);
    if (scoredTracks.length === 0) {
      throw new Error("Failed to score and rank tracks. Please try again.");
    }
    
    const finalPlaylist = {
      tracks: scoredTracks.slice(0, 20),
      intent: intent,
      created_at: new Date().toISOString(),
      name: generatePlaylistName(intent),
      total_tracks_found: uniqueTracks.length,
      recommendation_confidence: calculateConfidenceScore(scoredTracks.slice(0, 20)),
      platforms: platforms
    };
    
    console.log("Created playlist with tracks:", finalPlaylist.tracks.length);
    
    return new Response(JSON.stringify(finalPlaylist), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error processing music request:", error);
    
    // Categorize errors for better client handling
    const errorResponse = {
      error: error.message,
      type: categorizeError(error),
      details: error.toString(),
      timestamp: new Date().toISOString()
    };
    
    return new Response(JSON.stringify(errorResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: determineErrorStatus(error),
    });
  }
});

function calculateConfidenceScore(tracks: any[]): number {
  if (!tracks.length) return 0;
  const avgScore = tracks.reduce((sum, track) => sum + (track.match_score || 0), 0) / tracks.length;
  return Math.round(avgScore);
}

function categorizeError(error: Error): string {
  if (error.message.includes("Spotify")) return "SPOTIFY_API_ERROR";
  if (error.message.includes("YouTube")) return "YOUTUBE_API_ERROR";
  if (error.message.includes("prompt")) return "INVALID_INPUT";
  if (error.message.includes("No tracks")) return "NO_RESULTS";
  if (error.message.includes("authenticate")) return "AUTH_ERROR";
  return "UNKNOWN_ERROR";
}

function determineErrorStatus(error: Error): number {
  if (error.message.includes("required") || !error.message) return 400;
  if (error.message.includes("authenticate")) return 401;
  if (error.message.includes("No tracks") || error.message.includes("Failed to score")) return 404;
  return 500;
}
