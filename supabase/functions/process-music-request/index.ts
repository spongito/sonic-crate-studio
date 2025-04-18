
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from './cors.ts';
import { createStructuredIntent } from './intent-analyzer.ts';
import { getSpotifyToken, getRecommendations, enrichTracksWithAudioFeatures } from './spotify-client.ts';
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

    const { prompt, advancedParams } = await req.json();
    
    if (!prompt || typeof prompt !== 'string') {
      throw new Error("A valid text prompt is required");
    }
    
    console.log("Request received:", { prompt, advancedParams });
    
    // Intent Analysis
    const intent = await createStructuredIntent(prompt, advancedParams).catch(error => {
      console.error("Intent analysis failed:", error);
      throw new Error("Failed to analyze music request: " + error.message);
    });
    console.log("Created structured intent:", JSON.stringify(intent, null, 2));
    
    // Spotify Authentication
    const spotifyToken = await getSpotifyToken();
    if (!spotifyToken) {
      throw new Error("Failed to authenticate with Spotify");
    }
    
    // Track Search
    const { tracks, seedTracks, seedArtists } = await executeSearchFlow(intent, spotifyToken).catch(error => {
      console.error("Search flow failed:", error);
      throw new Error("Failed to search for tracks: " + error.message);
    });
    console.log(`Found ${tracks.length} tracks through search`);
    
    if (tracks.length === 0 && seedTracks.length === 0) {
      throw new Error("No tracks found matching your criteria. Try different search terms or genres.");
    }
    
    // Recommendations
    const recommendedTracks = await getRecommendations(seedTracks, seedArtists, intent, spotifyToken).catch(error => {
      console.error("Recommendations failed:", error);
      // Don't throw here, we can continue with search results only
      return [];
    });
    console.log(`Found ${recommendedTracks.length} tracks through recommendations`);
    
    // Combine and deduplicate tracks
    const combinedTracks = [...tracks, ...recommendedTracks];
    if (combinedTracks.length === 0) {
      throw new Error("No tracks could be found or recommended. Please try different search criteria.");
    }
    
    const uniqueTracks = Array.from(new Map(combinedTracks.map(track => [track.id, track])).values());
    console.log(`Combined unique tracks: ${uniqueTracks.length}`);
    
    // Enrich with audio features and score tracks
    const tracksWithFeatures = await enrichTracksWithAudioFeatures(uniqueTracks, spotifyToken).catch(error => {
      console.error("Audio features enrichment failed:", error);
      // Continue without audio features if needed
      return uniqueTracks;
    });
    
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
      recommendation_confidence: calculateConfidenceScore(scoredTracks.slice(0, 20))
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

