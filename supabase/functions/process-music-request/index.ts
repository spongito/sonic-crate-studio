
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
    const { prompt, advancedParams } = await req.json();
    console.log("Request received:", { prompt, advancedParams });
    
    const intent = await createStructuredIntent(prompt, advancedParams);
    console.log("Created structured intent:", JSON.stringify(intent, null, 2));
    
    const spotifyToken = await getSpotifyToken();
    if (!spotifyToken) {
      throw new Error("Failed to get Spotify authentication token");
    }
    
    const { tracks, seedTracks, seedArtists } = await executeSearchFlow(intent, spotifyToken);
    console.log(`Found ${tracks.length} tracks through search`);
    
    const recommendedTracks = await getRecommendations(seedTracks, seedArtists, intent, spotifyToken);
    console.log(`Found ${recommendedTracks.length} tracks through recommendations`);
    
    const combinedTracks = [...tracks, ...recommendedTracks];
    const uniqueTracks = Array.from(new Map(combinedTracks.map(track => [track.id, track])).values());
    console.log(`Combined unique tracks: ${uniqueTracks.length}`);
    
    const tracksWithFeatures = await enrichTracksWithAudioFeatures(uniqueTracks, spotifyToken);
    const scoredTracks = scoreTracksBasedOnIntent(tracksWithFeatures, intent);
    
    const finalPlaylist = {
      tracks: scoredTracks.slice(0, 20),
      intent: intent,
      created_at: new Date().toISOString(),
      name: generatePlaylistName(intent)
    };
    
    console.log("Created playlist with tracks:", finalPlaylist.tracks.length);
    
    return new Response(JSON.stringify(finalPlaylist), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error processing music request:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.toString(),
      type: error.name || "Unknown error type"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
