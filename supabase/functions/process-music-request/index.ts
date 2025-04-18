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
    
    try {
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
      // Check if this is an OpenAI quota error
      if (error.message && error.message.includes("insufficient_quota")) {
        console.error("OpenAI API quota exceeded:", error);
        
        // Create a simple fallback playlist without the GPT processing
        const simpleIntent = createSimpleIntent(prompt, advancedParams);
        const spotifyTracks = await searchSpotifyDirectly(prompt, advancedParams);
        
        const fallbackPlaylist = {
          tracks: spotifyTracks.slice(0, 20).map((track, index) => ({
            ...track,
            score: 100 - index * 3, // Simple decreasing score based on search relevance
            reasoning: "Selected based on search relevance to your query",
            position: index + 1
          })),
          intent: simpleIntent,
          created_at: new Date().toISOString(),
          name: `Playlist - ${new Date().toLocaleDateString()}`
        };
        
        return new Response(JSON.stringify(fallbackPlaylist), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      // Other errors
      throw error;
    }
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

// Create a simple intent object without using GPT
function createSimpleIntent(prompt, advancedParams) {
  return {
    original_prompt: prompt,
    advanced_params: advancedParams,
    genre: advancedParams.genre || extractGenre(prompt),
    mood: extractMood(prompt),
    energy: advancedParams.commercialFactor > 50 ? "high" : "medium",
    reference_artists: advancedParams.referenceArtists ? advancedParams.referenceArtists.split(',').map(a => a.trim()) : []
  };
}

// Basic genre extraction from prompt
function extractGenre(prompt) {
  const commonGenres = [
    "rock", "pop", "hip hop", "rap", "jazz", "blues", "country", "r&b", "soul",
    "electronic", "dance", "techno", "house", "ambient", "classical", "folk",
    "reggae", "metal", "punk", "indie", "alternative", "disco", "funk"
  ];
  
  const promptLower = prompt.toLowerCase();
  for (const genre of commonGenres) {
    if (promptLower.includes(genre)) {
      return genre;
    }
  }
  return "";
}

// Basic mood extraction from prompt
function extractMood(prompt) {
  const moodMap = {
    happy: ["happy", "upbeat", "cheerful", "joyful", "uplifting"],
    sad: ["sad", "melancholy", "somber", "depressing", "gloomy"],
    calm: ["calm", "peaceful", "relaxing", "chill", "soothing"],
    energetic: ["energetic", "lively", "dynamic", "excited", "pumped"],
    romantic: ["romantic", "love", "sensual", "intimate"],
    angry: ["angry", "aggressive", "intense", "rage", "furious"]
  };
  
  const promptLower = prompt.toLowerCase();
  for (const [mood, keywords] of Object.entries(moodMap)) {
    for (const keyword of keywords) {
      if (promptLower.includes(keyword)) {
        return mood;
      }
    }
  }
  return "neutral";
}

async function processWithGPT(prompt: string, advancedParams: any) {
  try {
    console.log("Processing with GPT:", { prompt, advancedParams });
    
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

    // Check if the response is ok
    if (!response.ok) {
      const errorText = await response.text();
      
      // Check if this is a quota error
      if (errorText.includes("insufficient_quota")) {
        const error = new Error("OpenAI API quota exceeded");
        error.name = "InsufficientQuotaError";
        throw error;
      }
      
      throw new Error(`GPT API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Check if the expected fields exist before accessing them
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      console.error("Unexpected OpenAI API response:", JSON.stringify(data));
      throw new Error("Invalid response format from OpenAI API");
    }
    
    const processedData = JSON.parse(data.choices[0].message.content);
    
    return {
      ...processedData,
      original_prompt: prompt,
      advanced_params: advancedParams
    };
  } catch (error) {
    console.error("GPT processing error:", error);
    throw error;
  }
}

async function getSpotifyToken() {
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${spotifyClientId}:${spotifyClientSecret}`)}`
      },
      body: 'grant_type=client_credentials'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Spotify auth error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Spotify token error:", error);
    throw new Error("Failed to get Spotify access token");
  }
}

// Direct Spotify search with query
async function searchSpotifyDirectly(query: string, advancedParams: any) {
  try {
    const token = await getSpotifyToken();
    const searchParams = new URLSearchParams();
    
    let searchQuery = query;
    if (advancedParams.genre) {
      searchQuery += ` genre:${advancedParams.genre}`;
    }
    if (advancedParams.referenceArtists) {
      searchQuery += ` ${advancedParams.referenceArtists}`;
    }
    
    searchParams.append('q', searchQuery.trim());
    searchParams.append('type', 'track');
    searchParams.append('limit', '30');
    
    console.log("Direct Spotify search query:", searchQuery);
    
    const response = await fetch(`https://api.spotify.com/v1/search?${searchParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Spotify API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      console.error("Spotify API error:", data.error);
      return [];
    }
    
    if (!data.tracks || !data.tracks.items) {
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
  } catch (error) {
    console.error("Spotify direct search error:", error);
    throw new Error("Failed to search Spotify directly");
  }
}

async function searchSpotify(processedIntent: any) {
  try {
    const token = await getSpotifyToken();
    
    // Build search query based on processed intent
    const searchParams = new URLSearchParams();
    
    let query = '';
    if (processedIntent.genre) query += `genre:"${processedIntent.genre}" `;
    if (processedIntent.reference_artists && processedIntent.reference_artists.length > 0) {
      if (Array.isArray(processedIntent.reference_artists)) {
        query += `artist:"${processedIntent.reference_artists[0]}" `;
      } else if (typeof processedIntent.reference_artists === 'string') {
        query += `artist:"${processedIntent.reference_artists}" `;
      }
    }
    if (processedIntent.mood && processedIntent.mood.length > 0) {
      if (Array.isArray(processedIntent.mood)) {
        query += processedIntent.mood.slice(0, 2).join(' ');
      } else if (typeof processedIntent.mood === 'string') {
        query += processedIntent.mood;
      }
    }
    
    // If query is still empty, use the original prompt as a fallback
    if (!query.trim()) {
      query = processedIntent.original_prompt || "";
    }
    
    searchParams.append('q', query.trim());
    searchParams.append('type', 'track');
    searchParams.append('limit', '30');
    
    console.log("Spotify search query:", query);
    
    const response = await fetch(`https://api.spotify.com/v1/search?${searchParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Spotify API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      console.error("Spotify API error:", data.error);
      return [];
    }
    
    if (!data.tracks || !data.tracks.items) {
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
  } catch (error) {
    console.error("Spotify search error:", error);
    throw new Error("Failed to search Spotify");
  }
}

async function createPlaylistWithGPT(processedIntent: any, tracks: any[]) {
  try {
    if (tracks.length === 0) {
      return {
        tracks: [],
        intent: processedIntent,
        created_at: new Date().toISOString(),
        name: `Playlist - ${new Date().toLocaleDateString()}`
      };
    }
    
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
            Return a JSON object with a "tracks" array containing track objects with the following properties:
            - id: The original track ID
            - score: A number from 0-100 indicating how well it matches
            - reasoning: A brief explanation of why this track was selected
            - position: The recommended position in the playlist (1-20)
            
            Only return a valid JSON object with no other text.` 
          },
          { 
            role: 'user', 
            content: `User intent: ${JSON.stringify(processedIntent)}\n\nAvailable tracks: ${JSON.stringify(tracks)}` 
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      // Check if this is a quota error
      if (errorText.includes("insufficient_quota")) {
        // Instead of throwing, create a simplified playlist without the GPT ranking
        return createSimplePlaylist(processedIntent, tracks);
      }
      
      throw new Error(`GPT API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Check if the expected fields exist before accessing them
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      console.error("Unexpected OpenAI API response for playlist creation:", JSON.stringify(data));
      
      // Use the fallback playlist creation instead
      return createSimplePlaylist(processedIntent, tracks);
    }
    
    const processedPlaylist = JSON.parse(data.choices[0].message.content);
    
    // Match the selected tracks with full track data
    const trackMap = new Map();
    tracks.forEach((track) => trackMap.set(track.id, track));
    
    let finalPlaylist = [];
    
    if (processedPlaylist && processedPlaylist.tracks && Array.isArray(processedPlaylist.tracks)) {
      finalPlaylist = processedPlaylist.tracks
        .map((item: any) => {
          const trackData = trackMap.get(item.id);
          if (!trackData) return null;
          return {
            ...trackData,
            score: item.score || 50,
            reasoning: item.reasoning || "Selected based on your preferences",
            position: item.position || 0
          };
        })
        .filter(Boolean) // Remove any null entries
        .sort((a: any, b: any) => (a.position || 0) - (b.position || 0));
    }
    
    return {
      tracks: finalPlaylist,
      intent: processedIntent,
      created_at: new Date().toISOString(),
      name: `Playlist - ${new Date().toLocaleDateString()}`
    };
  } catch (error) {
    console.error("Playlist creation error:", error);
    
    // Fallback to simplified playlist creation
    return createSimplePlaylist(processedIntent, tracks);
  }
}

// Create a simplified playlist without GPT processing
function createSimplePlaylist(processedIntent: any, tracks: any[]) {
  const sortedTracks = [...tracks].sort((a, b) => b.popularity - a.popularity);
  
  const finalPlaylist = sortedTracks.slice(0, 20).map((track, index) => ({
    ...track,
    score: 100 - index * 3, // Simple decreasing score based on popularity
    reasoning: `Selected based on popularity and relevance to your ${processedIntent.genre || 'request'}`,
    position: index + 1
  }));
  
  return {
    tracks: finalPlaylist,
    intent: processedIntent,
    created_at: new Date().toISOString(),
    name: `Playlist - ${new Date().toLocaleDateString()}`
  };
}
