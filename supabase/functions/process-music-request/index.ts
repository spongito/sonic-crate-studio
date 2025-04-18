
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const spotifyClientId = Deno.env.get('SPOTIFY_CLIENT_ID');
const spotifyClientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET');

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const { prompt, advancedParams } = await req.json();
    
    // Step 1: Process the user's request with GPT-4o
    const processedIntent = await processWithGPT(prompt, advancedParams);
    
    // Step 2: Query music APIs with the processed intent
    const spotifyTracks = await searchSpotify(processedIntent);
    
    // Step 3: Post-process with GPT to create the final playlist
    const finalPlaylist = await createPlaylistWithGPT(processedIntent, spotifyTracks);
    
    return new Response(JSON.stringify(finalPlaylist), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error processing music request:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function processWithGPT(prompt: string, advancedParams: any) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a music curator AI that analyzes music requests and converts them into structured data for API queries. Extract mood, genre, style, energy level, and keywords from the input.' 
          },
          { 
            role: 'user', 
            content: `User request: "${prompt}"\nAdvanced parameters: ${JSON.stringify(advancedParams)}` 
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    const processedData = JSON.parse(data.choices[0].message.content);
    
    return {
      ...processedData,
      original_prompt: prompt,
      advanced_params: advancedParams
    };
  } catch (error) {
    console.error("GPT processing error:", error);
    throw new Error("Failed to process request with GPT");
  }
}

async function getSpotifyToken() {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(`${spotifyClientId}:${spotifyClientSecret}`)}`
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();
  return data.access_token;
}

async function searchSpotify(processedIntent: any) {
  const token = await getSpotifyToken();
  
  // Build search query based on processed intent
  const searchParams = new URLSearchParams();
  
  let query = '';
  if (processedIntent.genre) query += `genre:"${processedIntent.genre}" `;
  if (processedIntent.reference_artists && processedIntent.reference_artists.length > 0) {
    query += `artist:"${processedIntent.reference_artists[0]}" `;
  }
  if (processedIntent.mood && processedIntent.mood.length > 0) {
    query += processedIntent.mood.slice(0, 2).join(' ');
  }
  
  searchParams.append('q', query.trim());
  searchParams.append('type', 'track');
  searchParams.append('limit', '30');
  
  const response = await fetch(`https://api.spotify.com/v1/search?${searchParams.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();
  
  if (data.error) {
    console.error("Spotify API error:", data.error);
    return [];
  }
  
  return data.tracks.items.map((track: any) => ({
    id: track.id,
    name: track.name,
    artist: track.artists.map((artist: any) => artist.name).join(', '),
    album: track.album.name,
    image: track.album.images[0]?.url || '',
    preview_url: track.preview_url,
    external_url: track.external_urls.spotify,
    popularity: track.popularity,
    platform: 'spotify'
  }));
}

async function createPlaylistWithGPT(processedIntent: any, tracks: any[]) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: `You are a professional DJ and music curator. Your task is to analyze a list of tracks and select the best 20 that match the user's intent. 
            Return a JSON array of track objects with the following properties:
            - id: The original track ID
            - score: A number from 0-100 indicating how well it matches
            - reasoning: A brief explanation of why this track was selected
            - position: The recommended position in the playlist (1-20)
            
            Only return a valid JSON array with no other text.` 
          },
          { 
            role: 'user', 
            content: `User intent: ${JSON.stringify(processedIntent)}\n\nAvailable tracks: ${JSON.stringify(tracks)}` 
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    const processedPlaylist = JSON.parse(data.choices[0].message.content);
    
    // Match the selected tracks with full track data
    const trackMap = new Map();
    tracks.forEach((track) => trackMap.set(track.id, track));
    
    const finalPlaylist = Array.isArray(processedPlaylist.tracks) 
      ? processedPlaylist.tracks.map((item: any) => ({
          ...trackMap.get(item.id),
          score: item.score,
          reasoning: item.reasoning,
          position: item.position
        })).sort((a: any, b: any) => a.position - b.position)
      : [];
    
    return {
      tracks: finalPlaylist,
      intent: processedIntent,
      created_at: new Date().toISOString(),
      name: `Playlist - ${new Date().toLocaleDateString()}`
    };
  } catch (error) {
    console.error("Playlist creation error:", error);
    throw new Error("Failed to create playlist");
  }
}
