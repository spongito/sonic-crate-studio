
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
    console.log("Request received:", { prompt, advancedParams });
    
    // Skip GPT processing completely and go directly to Spotify search
    // This is our fallback mode when OpenAI API is unavailable
    console.log("Bypassing GPT processing due to quota limits - using direct Spotify search");
    
    // Create a simple intent object without using GPT
    const simpleIntent = createSimpleIntent(prompt, advancedParams);
    console.log("Created simple intent:", simpleIntent);
    
    // Search Spotify directly with the prompt and params
    const spotifyTracks = await searchSpotifyDirectly(prompt, advancedParams);
    console.log(`Found ${spotifyTracks.length} tracks from Spotify`);
    
    if (spotifyTracks.length === 0) {
      throw new Error("No tracks found matching your criteria");
    }
    
    // Create a simple playlist without GPT
    const fallbackPlaylist = {
      tracks: spotifyTracks.slice(0, 20).map((track, index) => ({
        ...track,
        score: 100 - index * 3, // Simple decreasing score based on search relevance
        reasoning: "Selected based on search relevance to your query",
        position: index + 1
      })),
      intent: simpleIntent,
      created_at: new Date().toISOString(),
      name: `${simpleIntent.genre || 'Hip Hop'} Mix - ${new Date().toLocaleDateString()}`
    };
    
    console.log("Created fallback playlist with tracks:", fallbackPlaylist.tracks.length);
    
    return new Response(JSON.stringify(fallbackPlaylist), {
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

// Create a simple intent object without using GPT
function createSimpleIntent(prompt, advancedParams) {
  return {
    original_prompt: prompt,
    advanced_params: advancedParams,
    description: advancedParams.description || prompt,
    mood_tags: extractMoodWords(prompt),
    genre: advancedParams.genre || extractGenre(prompt) || prompt,
    style: advancedParams.mode || "club-ready",
    set_length_minutes: parseSetLength(advancedParams.length),
    obscurity: calculateObscurityLevel(advancedParams.commercialFactor),
    reference_artists: advancedParams.referenceArtists ? advancedParams.referenceArtists.split(',').map(a => a.trim()) : [],
    keywords: extractKeywords(prompt)
  };
}

// Helper function to parse set length (e.g., "1.5h" to minutes)
function parseSetLength(lengthStr) {
  if (!lengthStr) return 90; // Default to 90 minutes
  
  const match = lengthStr.match(/^(\d+(?:\.\d+)?)h$/);
  if (match) {
    return Math.round(parseFloat(match[1]) * 60);
  }
  
  const minutesMatch = lengthStr.match(/^(\d+)m$/);
  if (minutesMatch) {
    return parseInt(minutesMatch[1]);
  }
  
  return 90; // Default
}

// Helper function to convert commercialFactor to obscurity
function calculateObscurityLevel(commercialFactor) {
  if (commercialFactor === undefined || commercialFactor === null) return 0.5;
  return 1 - (commercialFactor / 100);
}

// Extract mood words from prompt
function extractMoodWords(prompt) {
  const moodMap = {
    "happy": ["happy", "upbeat", "cheerful", "joyful", "uplifting"],
    "sad": ["sad", "melancholy", "somber", "depressing", "gloomy"],
    "calm": ["calm", "peaceful", "relaxing", "chill", "soothing"],
    "energetic": ["energetic", "lively", "dynamic", "excited", "pumped"],
    "romantic": ["romantic", "love", "sensual", "intimate"],
    "dark": ["dark", "moody", "atmospheric", "mysterious"],
    "uplifting": ["uplifting", "inspiring", "motivational", "empowering"],
    "nostalgic": ["nostalgic", "retro", "throwback", "classic"]
  };
  
  const promptLower = prompt.toLowerCase();
  const foundMoods = [];
  
  for (const [mood, keywords] of Object.entries(moodMap)) {
    for (const keyword of keywords) {
      if (promptLower.includes(keyword) && !foundMoods.includes(mood)) {
        foundMoods.push(mood);
      }
    }
  }
  
  return foundMoods.length > 0 ? foundMoods : ["neutral"];
}

// Basic genre extraction from prompt
function extractGenre(prompt) {
  const commonGenres = [
    "rock", "pop", "hip hop", "rap", "jazz", "blues", "country", "r&b", "soul",
    "electronic", "dance", "techno", "house", "ambient", "classical", "folk",
    "reggae", "metal", "punk", "indie", "alternative", "disco", "funk", "afrobeat"
  ];
  
  const promptLower = prompt.toLowerCase();
  for (const genre of commonGenres) {
    if (promptLower.includes(genre)) {
      return genre;
    }
  }
  return "";
}

// Extract keywords from prompt
function extractKeywords(prompt) {
  const words = prompt.toLowerCase().split(/\s+/);
  const stopwords = ["a", "an", "the", "and", "or", "but", "for", "with", "in", "on", "at", "to", "of"];
  
  return words
    .filter(word => !stopwords.includes(word))
    .filter(word => word.length > 3) // Only meaningful words
    .slice(0, 5); // Top 5 keywords
}

// Direct Spotify search with query (main method)
async function searchSpotifyDirectly(query, advancedParams) {
  try {
    const token = await getSpotifyToken();
    const searchParams = new URLSearchParams();
    
    let searchQuery = query;
    if (advancedParams.genre && advancedParams.genre !== "any") {
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
    
    return data.tracks.items.map((track) => ({
      id: track.id,
      name: track.name,
      artist: track.artists.map((artist) => artist.name).join(', '),
      album: track.album.name,
      image: track.album.images[0]?.url || '',
      preview_url: track.preview_url,
      external_url: track.external_urls.spotify,
      popularity: track.popularity,
      platform: 'spotify',
      release_date: track.album.release_date || null
    }));
  } catch (error) {
    console.error("Spotify direct search error:", error);
    throw new Error("Failed to search Spotify directly: " + error.message);
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
    throw new Error("Failed to get Spotify access token: " + error.message);
  }
}
