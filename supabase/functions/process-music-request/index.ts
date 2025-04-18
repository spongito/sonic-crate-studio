
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
    
    try {
      // Step 1: Process the user's request with GPT-4o to get structured data
      const processedIntent = await processWithGPT(prompt, advancedParams);
      console.log("Processed intent:", processedIntent);
      
      // Step 2: Build a smart Spotify query and get tracks
      const spotifyTracks = await searchSpotifyWithFallbacks(processedIntent);
      console.log(`Found ${spotifyTracks.length} tracks from Spotify`);
      
      if (spotifyTracks.length === 0) {
        throw new Error("No tracks found matching your criteria");
      }
      
      // Step 3: Let GPT curate and organize the final playlist
      const finalPlaylist = await createPlaylistWithGPT(processedIntent, spotifyTracks);
      console.log("Final playlist created with tracks:", finalPlaylist.tracks.length);
      
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
        
        console.log("Created fallback playlist due to quota limits");
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
    description: advancedParams.description || prompt,
    mood_tags: extractMoodWords(prompt),
    genre: advancedParams.genre || extractGenre(prompt),
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
            content: `You are a DJ and music curator AI. Analyze the music request and convert it into structured data.
            Return ONLY a valid JSON object with these exact keys (no explanation or additional text):
            {
              "description": "Brief description of the playlist/set",
              "mood_tags": ["tag1", "tag2"...] (2-5 mood tags),
              "genre": "Primary music genre",
              "style": "One of: club-ready, crate-dig, classic",
              "set_length_minutes": Integer value of set length in minutes,
              "obscurity": Number between 0-1 (0=commercial, 1=underground),
              "reference_artists": ["artist1", "artist2"...] (0-5 artists),
              "keywords": ["keyword1", "keyword2"...] (3-6 keywords for search)
            }`
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
    
    let processedData;
    try {
      processedData = JSON.parse(data.choices[0].message.content);
    } catch (e) {
      console.error("Failed to parse GPT JSON response:", data.choices[0].message.content);
      throw new Error("Invalid JSON response from GPT");
    }
    
    // Validate required fields
    const requiredFields = ["description", "mood_tags", "genre", "keywords"];
    const missingFields = requiredFields.filter(field => !processedData[field]);
    
    if (missingFields.length > 0) {
      console.warn("Missing fields in GPT response:", missingFields);
      // Fill in missing fields with defaults
      missingFields.forEach(field => {
        if (field === "description") processedData.description = prompt;
        if (field === "mood_tags") processedData.mood_tags = extractMoodWords(prompt);
        if (field === "genre") processedData.genre = extractGenre(prompt);
        if (field === "keywords") processedData.keywords = extractKeywords(prompt);
      });
    }
    
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

// Smart Spotify query builder with fallbacks
async function searchSpotifyWithFallbacks(processedIntent: any) {
  try {
    const token = await getSpotifyToken();
    
    // Try increasingly broader search strategies until we get results
    const strategies = [
      // Strategy 1: Try with artist + genre + primary keyword
      () => {
        let query = '';
        
        if (processedIntent.reference_artists && processedIntent.reference_artists.length > 0) {
          if (Array.isArray(processedIntent.reference_artists)) {
            query += `artist:"${processedIntent.reference_artists[0]}" `;
          } else if (typeof processedIntent.reference_artists === 'string') {
            query += `artist:"${processedIntent.reference_artists}" `;
          }
        }
        
        if (processedIntent.genre) query += `genre:"${processedIntent.genre}" `;
        
        if (processedIntent.keywords && processedIntent.keywords.length > 0) {
          if (Array.isArray(processedIntent.keywords)) {
            query += processedIntent.keywords[0];
          } else if (typeof processedIntent.keywords === 'string') {
            query += processedIntent.keywords;
          }
        }
        
        return query.trim();
      },
      
      // Strategy 2: Try with just genre + primary mood
      () => {
        let query = '';
        
        if (processedIntent.genre) query += `genre:"${processedIntent.genre}" `;
        
        if (processedIntent.mood_tags && processedIntent.mood_tags.length > 0) {
          if (Array.isArray(processedIntent.mood_tags)) {
            query += processedIntent.mood_tags[0];
          } else if (typeof processedIntent.mood_tags === 'string') {
            query += processedIntent.mood_tags;
          }
        }
        
        return query.trim();
      },
      
      // Strategy 3: Just use the genre or keywords
      () => {
        if (processedIntent.genre) return `genre:"${processedIntent.genre}"`;
        if (processedIntent.keywords && processedIntent.keywords.length > 0) {
          if (Array.isArray(processedIntent.keywords)) {
            return processedIntent.keywords.slice(0, 3).join(" ");
          }
          return processedIntent.keywords;
        }
        return processedIntent.description || processedIntent.original_prompt;
      }
    ];
    
    for (const strategy of strategies) {
      const query = strategy();
      
      if (!query) continue;
      
      console.log("Trying Spotify search query:", query);
      
      const searchParams = new URLSearchParams();
      searchParams.append('q', query);
      searchParams.append('type', 'track');
      searchParams.append('limit', '50'); // Get more tracks to improve curation quality
      
      const response = await fetch(`https://api.spotify.com/v1/search?${searchParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Spotify API error: ${response.status} - ${errorText}`);
        continue;
      }
      
      const data = await response.json();
      
      if (data.error) {
        console.error("Spotify API error:", data.error);
        continue;
      }
      
      if (!data.tracks || !data.tracks.items || data.tracks.items.length === 0) {
        console.log("No tracks found with query:", query);
        continue;
      }
      
      // Success! We got tracks
      console.log(`Found ${data.tracks.items.length} tracks with query: ${query}`);
      
      return data.tracks.items.map((track: any) => ({
        id: track.id,
        name: track.name,
        artist: track.artists.map((artist: any) => artist.name).join(', '),
        album: track.album.name,
        image: track.album.images[0]?.url || '',
        preview_url: track.preview_url,
        external_url: track.external_urls.spotify,
        popularity: track.popularity,
        platform: 'spotify',
        release_date: track.album.release_date || null,
        match_data: {
          genre: processedIntent.genre,
          style: processedIntent.style,
          query: query
        }
      }));
    }
    
    // If all strategies failed, fall back to direct query
    return searchSpotifyDirectly(processedIntent.original_prompt, processedIntent.advanced_params);
    
  } catch (error) {
    console.error("Spotify search error:", error);
    throw new Error("Failed to search Spotify");
  }
}

// Direct Spotify search with query (fallback)
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
            - score: A number from 0-100 indicating how well the track matches the intent
            - reasoning: A brief explanation of why this track was selected (1-2 sentences)
            - position: The recommended position in the playlist (1-20) for optimal flow
            
            Consider the mood, genre, and style requested. Create a cohesive playlist with a good flow from start to finish.
            Only return valid JSON with no additional text.` 
          },
          { 
            role: 'user', 
            content: `User intent: ${JSON.stringify(processedIntent)}\n\nAvailable tracks: ${JSON.stringify(tracks.slice(0, 30))}` 
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
    
    let processedPlaylist;
    try {
      processedPlaylist = JSON.parse(data.choices[0].message.content);
    } catch (e) {
      console.error("Failed to parse GPT JSON response for playlist:", data.choices[0].message.content);
      return createSimplePlaylist(processedIntent, tracks);
    }
    
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
    
    const playlistName = `${processedIntent.mood_tags?.[0] || ''} ${processedIntent.genre || ''} Set`;
    
    return {
      tracks: finalPlaylist,
      intent: processedIntent,
      created_at: new Date().toISOString(),
      name: playlistName.trim() || `Playlist - ${new Date().toLocaleDateString()}`
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
    name: processedIntent.genre 
      ? `${processedIntent.genre.charAt(0).toUpperCase() + processedIntent.genre.slice(1)} Mix` 
      : `Playlist - ${new Date().toLocaleDateString()}`
  };
}
