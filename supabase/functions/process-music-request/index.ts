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
      throw new Error("YouTube API key is not configured. Please add it to your environment variables.");
    }
    
    // Intent Analysis
    const intent = await createStructuredIntent(prompt, advancedParams).catch(error => {
      console.error("Intent analysis failed:", error);
      throw new Error("Failed to analyze music request: " + error.message);
    });
    console.log("Created structured intent:", JSON.stringify(intent, null, 2));
    
    // Spotify Authentication (only needed if Spotify is selected)
    let spotifyToken = null;
    if (platforms.includes('spotify')) {
      try {
        spotifyToken = await getSpotifyToken();
        console.log("Obtained Spotify token successfully");
      } catch (error) {
        console.error("Spotify auth failed:", error);
        // Only throw if Spotify is the only selected platform
        if (platforms.length === 1) {
          throw new Error("Failed to authenticate with Spotify. Please check your Spotify API credentials.");
        } else {
          console.log("Continuing with other platforms due to Spotify auth failure");
        }
      }
    } else {
      console.log("Spotify not selected, skipping authentication");
    }
    
    // Track Search across selected platforms
    const { tracks, seedTracks, seedArtists } = await executeSearchFlow(intent, spotifyToken, platforms).catch(error => {
      console.error("Search flow failed:", error);
      throw new Error("Failed to search for tracks: " + error.message);
    });
    console.log(`Found ${tracks.length} tracks through search`);
    
    if (tracks.length === 0) {
      throw new Error("No tracks found matching your criteria. Try different search terms or genres.");
    }
    
    // Recommendations (only for Spotify if we have seedTracks)
    let recommendedTracks = [];
    if (platforms.includes('spotify') && spotifyToken && seedTracks && seedTracks.length > 0) {
      recommendedTracks = await getRecommendations(seedTracks, seedArtists, intent, spotifyToken).catch(error => {
        console.error("Recommendations failed:", error);
        // Don't throw here, we can continue with search results only
        return [];
      });
      console.log(`Found ${recommendedTracks.length} tracks through recommendations`);
    }
    
    // Combine and deduplicate tracks
    const combinedTracks = [...tracks, ...recommendedTracks];
    if (combinedTracks.length === 0) {
      throw new Error("No tracks could be found or recommended. Please try different search criteria.");
    }
    
    const uniqueTracks = Array.from(new Map(combinedTracks.map(track => 
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
        const enrichedSpotifyTracks = await enrichTracksWithAudioFeatures(spotifyTracks, spotifyToken).catch(error => {
          console.error("Audio features enrichment failed:", error);
          // Continue without audio features if needed
          return spotifyTracks;
        });
        
        // Replace Spotify tracks with enriched versions
        const nonSpotifyTracks = uniqueTracks.filter(track => track.platform !== 'spotify');
        tracksWithFeatures = [...enrichedSpotifyTracks, ...nonSpotifyTracks];
      }
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
