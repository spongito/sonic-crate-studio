
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
    
    // Step 1: Create a structured intent object from the user prompt and parameters
    const intent = await createStructuredIntent(prompt, advancedParams);
    console.log("Created structured intent:", intent);
    
    // Step 2: Get Spotify access token
    const spotifyToken = await getSpotifyToken();
    if (!spotifyToken) {
      throw new Error("Failed to get Spotify authentication token");
    }
    
    // Step 3: Execute the multi-step search and curation flow
    const { tracks, seedTracks, seedArtists } = await executeSearchFlow(intent, spotifyToken);
    console.log(`Found ${tracks.length} tracks through search`);
    
    // Step 4: Get recommendations based on search results
    const recommendedTracks = await getRecommendations(seedTracks, seedArtists, intent, spotifyToken);
    console.log(`Found ${recommendedTracks.length} tracks through recommendations`);
    
    // Step 5: Combine search results with recommendations and deduplicate
    const combinedTracks = combineAndDeduplicateTracks([...tracks, ...recommendedTracks]);
    console.log(`Combined unique tracks: ${combinedTracks.length}`);
    
    // Step 6: Get audio features for all tracks
    const tracksWithFeatures = await enrichTracksWithAudioFeatures(combinedTracks, spotifyToken);
    
    // Step 7: Score and rank tracks based on match to intent
    const scoredTracks = scoreTracksBasedOnIntent(tracksWithFeatures, intent);
    
    // Step 8: Create the final playlist with the top tracks
    const finalPlaylist = {
      tracks: scoredTracks.slice(0, 20),  // Take top 20 tracks
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

// Step 1: Create a structured intent object from prompt and params
async function createStructuredIntent(prompt, advancedParams) {
  // Create a base intent object similar to the previous implementation
  const baseIntent = {
    original_prompt: prompt,
    advanced_params: advancedParams,
    description: advancedParams.description || prompt,
    mood_tags: extractMoodWords(prompt),
    genre: advancedParams.genre || extractGenre(prompt) || prompt,
    style: advancedParams.mode || "club-ready",
    set_length_minutes: parseSetLength(advancedParams.length),
    obscurity: calculateObscurityLevel(advancedParams.commercialFactor),
    reference_artists: advancedParams.referenceArtists ? advancedParams.referenceArtists.split(',').map(a => a.trim()) : [],
    keywords: extractKeywords(prompt),
    // Add new parameters for advanced search
    energy: 0.5, // Default values, will be adjusted below
    danceability: 0.5,
    valence: 0.5
  };
  
  // Use OpenAI to analyze the prompt if API key is available
  if (openAIApiKey) {
    try {
      const enhancedIntent = await analyzePromptWithGPT(prompt, advancedParams);
      return { ...baseIntent, ...enhancedIntent };
    } catch (error) {
      console.error("Error analyzing prompt with GPT:", error);
      console.log("Falling back to basic intent analysis");
      // Set some audio feature targets based on mood
      baseIntent.energy = calculateEnergyFromMoods(baseIntent.mood_tags);
      baseIntent.danceability = calculateDanceabilityFromStyle(baseIntent.style);
      baseIntent.valence = calculateValenceFromMoods(baseIntent.mood_tags);
      return baseIntent;
    }
  }
  
  // If no OpenAI API key, set some audio feature targets based on mood
  baseIntent.energy = calculateEnergyFromMoods(baseIntent.mood_tags);
  baseIntent.danceability = calculateDanceabilityFromStyle(baseIntent.style);
  baseIntent.valence = calculateValenceFromMoods(baseIntent.mood_tags);
  
  return baseIntent;
}

// Analyze prompt with GPT to extract more detailed intent
async function analyzePromptWithGPT(prompt, advancedParams) {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAIApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { 
            role: "system", 
            content: `You are a music curation assistant that analyzes user prompts about playlist desires. 
            Extract the following information and return it as a JSON object:
            - mood: array of mood descriptors (e.g. ["energetic", "uplifting", "dark"])
            - genres: array of likely genres (e.g. ["house", "techno", "ambient"])
            - energy: number between 0-1 (0 for calm, 1 for high energy)
            - danceability: number between 0-1 (how danceable the music should be)
            - valence: number between 0-1 (0 for sad/negative, 1 for happy/positive)
            - tempo_range: object with min and max BPM if specified
            - key_preference: music key if specified (e.g. "C Major")
            - era_preference: decade or era if specified (e.g. "90s" or "modern")
            
            Return ONLY the JSON object with no other text.`
          },
          { 
            role: "user", 
            content: `Analyze this playlist request: "${prompt}". 
            Consider these additional parameters: 
            Mode: ${advancedParams.mode || "club-ready"}
            Genre: ${advancedParams.genre || "not specified"}
            Commercial Factor: ${advancedParams.commercialFactor}/100 (higher means more commercial)
            Reference Artists: ${advancedParams.referenceArtists || "none"}`
          }
        ],
        temperature: 0.3,
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    const intentText = data.choices[0].message.content.trim();
    
    // Parse the JSON response
    let intentObject;
    try {
      // Try to extract JSON if it's wrapped in code blocks or has other text
      const jsonMatch = intentText.match(/```(?:json)?\s*([\s\S]*?)\s*```|(\{[\s\S]*\})/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[2]) : intentText;
      intentObject = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Error parsing GPT response as JSON:", parseError);
      console.log("Raw response:", intentText);
      throw new Error("Failed to parse intent from GPT response");
    }
    
    return {
      mood_tags: intentObject.mood || [],
      genres: intentObject.genres || [],
      energy: intentObject.energy !== undefined ? intentObject.energy : 0.5,
      danceability: intentObject.danceability !== undefined ? intentObject.danceability : 0.5,
      valence: intentObject.valence !== undefined ? intentObject.valence : 0.5,
      tempo_range: intentObject.tempo_range || { min: 0, max: 300 },
      key_preference: intentObject.key_preference || null,
      era_preference: intentObject.era_preference || null
    };
  } catch (error) {
    console.error("Error in GPT analysis:", error);
    throw error;
  }
}

// Step 3: Multi-step search flow
async function executeSearchFlow(intent, token) {
  // Initialize results
  let allTracks = [];
  let seedTracks = [];
  let seedArtists = [];
  
  try {
    // Search by reference artists if provided
    if (intent.reference_artists && intent.reference_artists.length > 0) {
      // Get artist IDs for reference artists
      const artistIds = await searchArtists(intent.reference_artists, token);
      seedArtists = artistIds.slice(0, 2); // Take top 2 for seeding
      
      // Get top tracks from reference artists
      const artistTracks = await getArtistTopTracks(artistIds.slice(0, 3), token);
      allTracks.push(...artistTracks);
      seedTracks = getSeedTracks(artistTracks, 3);
      
      // Get related artists and their top tracks
      const relatedArtistIds = await getRelatedArtists(artistIds[0], token);
      if (relatedArtistIds.length > 0) {
        const relatedTracks = await getArtistTopTracks(relatedArtistIds.slice(0, 2), token);
        allTracks.push(...relatedTracks);
      }
    }
    
    // Search by genre and mood keywords
    let searchQuery = intent.original_prompt;
    if (intent.genre && intent.genre !== "any") {
      searchQuery += ` genre:${intent.genre}`;
    }
    
    const searchResults = await searchTracks(searchQuery, token, 30);
    allTracks.push(...searchResults);
    
    // If we don't have enough seed tracks from artists, add some from search results
    if (seedTracks.length < 5) {
      const additionalSeeds = getSeedTracks(searchResults, 5 - seedTracks.length);
      seedTracks = [...seedTracks, ...additionalSeeds];
    }
    
    // If we still don't have enough tracks, try broader search
    if (allTracks.length < 10) {
      const broadSearchQuery = intent.mood_tags.join(' ') + ' ' + (intent.genre || '');
      const broadSearchResults = await searchTracks(broadSearchQuery, token, 30);
      allTracks.push(...broadSearchResults);
      
      // Add to seed tracks if needed
      if (seedTracks.length < 5) {
        const additionalSeeds = getSeedTracks(broadSearchResults, 5 - seedTracks.length);
        seedTracks = [...seedTracks, ...additionalSeeds];
      }
    }
    
    // Deduplicate tracks
    allTracks = combineAndDeduplicateTracks(allTracks);
    
    return { 
      tracks: allTracks,
      seedTracks: seedTracks.slice(0, 5), // Spotify allows max 5 seed tracks
      seedArtists: seedArtists.slice(0, 5) // Spotify allows max 5 seed artists
    };
  } catch (error) {
    console.error("Error in search flow:", error);
    throw error;
  }
}

// Step 4: Get recommendations based on seeds
async function getRecommendations(seedTracks, seedArtists, intent, token) {
  try {
    const params = new URLSearchParams();
    
    // Add seed tracks and artists (max 5 combined)
    const totalSeeds = seedTracks.length + seedArtists.length;
    const maxSeeds = 5;
    
    if (totalSeeds > maxSeeds) {
      const trackSeeds = seedTracks.slice(0, maxSeeds - Math.min(seedArtists.length, 2));
      const artistSeeds = seedArtists.slice(0, maxSeeds - trackSeeds.length);
      
      if (trackSeeds.length > 0) params.append('seed_tracks', trackSeeds.join(','));
      if (artistSeeds.length > 0) params.append('seed_artists', artistSeeds.join(','));
    } else {
      if (seedTracks.length > 0) params.append('seed_tracks', seedTracks.join(','));
      if (seedArtists.length > 0) params.append('seed_artists', seedArtists.join(','));
    }
    
    // Add target parameters based on intent
    params.append('limit', '50');
    
    if (intent.energy !== undefined) params.append('target_energy', intent.energy.toString());
    if (intent.danceability !== undefined) params.append('target_danceability', intent.danceability.toString());
    if (intent.valence !== undefined) params.append('target_valence', intent.valence.toString());
    
    // Add optional filters based on available intent data
    if (intent.tempo_range && intent.tempo_range.min) params.append('min_tempo', intent.tempo_range.min.toString());
    if (intent.tempo_range && intent.tempo_range.max) params.append('max_tempo', intent.tempo_range.max.toString());
    
    // Add popularity target based on obscurity preference (reverse of commercialFactor)
    const targetPopularity = Math.round((1 - intent.obscurity) * 100);
    params.append('target_popularity', targetPopularity.toString());
    
    // If we don't have enough seeds, return empty array
    if ((seedTracks.length + seedArtists.length) === 0) {
      console.log("No seeds available for recommendations");
      return [];
    }
    
    console.log("Getting recommendations with params:", params.toString());
    
    const response = await fetch(`https://api.spotify.com/v1/recommendations?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Spotify recommendations API error: ${response.status} - ${errorText}`);
      return [];
    }
    
    const data = await response.json();
    
    if (!data.tracks) {
      console.log("No recommendations returned from API");
      return [];
    }
    
    return data.tracks.map(formatSpotifyTrack);
  } catch (error) {
    console.error("Error getting recommendations:", error);
    return [];
  }
}

// Score tracks based on how well they match the intent
function scoreTracksBasedOnIntent(tracks, intent) {
  return tracks.map(track => {
    let score = 50; // Base score
    
    // Score based on audio features if available
    if (track.audio_features) {
      // Energy score (0-10 points)
      if (intent.energy !== undefined && track.audio_features.energy !== undefined) {
        const energyDiff = Math.abs(intent.energy - track.audio_features.energy);
        score += 10 - (energyDiff * 20); // 10 points for perfect match, 0 for max difference
      }
      
      // Danceability score (0-10 points)
      if (intent.danceability !== undefined && track.audio_features.danceability !== undefined) {
        const danceabilityDiff = Math.abs(intent.danceability - track.audio_features.danceability);
        score += 10 - (danceabilityDiff * 20);
      }
      
      // Valence score (0-10 points)
      if (intent.valence !== undefined && track.audio_features.valence !== undefined) {
        const valenceDiff = Math.abs(intent.valence - track.audio_features.valence);
        score += 10 - (valenceDiff * 20);
      }
      
      // Tempo score if tempo range is specified (0-10 points)
      if (intent.tempo_range && track.audio_features.tempo) {
        const tempo = track.audio_features.tempo;
        if (intent.tempo_range.min && intent.tempo_range.max) {
          if (tempo >= intent.tempo_range.min && tempo <= intent.tempo_range.max) {
            score += 10;
          } else {
            const minDiff = intent.tempo_range.min ? Math.max(0, intent.tempo_range.min - tempo) : 0;
            const maxDiff = intent.tempo_range.max ? Math.max(0, tempo - intent.tempo_range.max) : 0;
            const totalDiff = minDiff + maxDiff;
            score += Math.max(0, 10 - Math.min(10, totalDiff / 10));
          }
        }
      }
      
      // Key preference score (0-5 points)
      if (intent.key_preference && track.audio_features.key !== undefined) {
        const keyName = formatKey(track.audio_features.key, track.audio_features.mode);
        if (keyName.toLowerCase() === intent.key_preference.toLowerCase()) {
          score += 5;
        }
      }
    }
    
    // Commercial factor score (0-10 points)
    if (track.popularity !== undefined) {
      const targetPopularity = (1 - intent.obscurity) * 100;
      const popularityDiff = Math.abs(targetPopularity - track.popularity);
      score += 10 - Math.min(10, popularityDiff / 10);
    }
    
    // Add reasoning for the score
    let reasoning = "Selected based on ";
    const factors = [];
    
    if (intent.mood_tags && intent.mood_tags.length > 0) {
      factors.push(`mood (${intent.mood_tags.join(', ')})`);
    }
    
    if (intent.genre && intent.genre !== "any") {
      factors.push(`genre (${intent.genre})`);
    }
    
    if (track.audio_features && track.audio_features.energy !== undefined) {
      factors.push(`energy level (${Math.round(track.audio_features.energy * 100)}%)`);
    }
    
    if (track.audio_features && track.audio_features.danceability !== undefined) {
      factors.push(`danceability (${Math.round(track.audio_features.danceability * 100)}%)`);
    }
    
    reasoning += factors.join(', ');
    
    // Ensure the score is between 0 and 100
    score = Math.min(100, Math.max(0, Math.round(score)));
    
    return {
      ...track,
      match_score: score,
      score: score, // Keep for backward compatibility
      reasoning: reasoning
    };
  }).sort((a, b) => b.match_score - a.match_score); // Sort by score descending
}

// Helper function to search for artists
async function searchArtists(artistNames, token) {
  try {
    const artistIds = [];
    
    for (const artistName of artistNames) {
      const searchParams = new URLSearchParams();
      searchParams.append('q', artistName);
      searchParams.append('type', 'artist');
      searchParams.append('limit', '1');
      
      const response = await fetch(`https://api.spotify.com/v1/search?${searchParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        console.error(`Spotify artist search error: ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      
      if (data.artists && data.artists.items.length > 0) {
        artistIds.push(data.artists.items[0].id);
      }
    }
    
    return artistIds;
  } catch (error) {
    console.error("Error searching for artists:", error);
    return [];
  }
}

// Helper function to get top tracks for multiple artists
async function getArtistTopTracks(artistIds, token) {
  try {
    const allTracks = [];
    
    for (const artistId of artistIds) {
      const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        console.error(`Spotify top tracks error: ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      
      if (data.tracks && data.tracks.length > 0) {
        allTracks.push(...data.tracks.map(formatSpotifyTrack));
      }
    }
    
    return allTracks;
  } catch (error) {
    console.error("Error getting artist top tracks:", error);
    return [];
  }
}

// Helper function to get related artists
async function getRelatedArtists(artistId, token) {
  try {
    const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}/related-artists`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      console.error(`Spotify related artists error: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    
    if (data.artists && data.artists.length > 0) {
      return data.artists.slice(0, 3).map(artist => artist.id);
    }
    
    return [];
  } catch (error) {
    console.error("Error getting related artists:", error);
    return [];
  }
}

// Helper function to select seed tracks from a list of tracks
function getSeedTracks(tracks, count) {
  // Prioritize tracks with higher popularity for better recommendations
  const sortedTracks = [...tracks].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  return sortedTracks.slice(0, count).map(track => track.id);
}

// Direct Spotify search with query
async function searchTracks(query, token, limit = 20) {
  try {
    const searchParams = new URLSearchParams();
    searchParams.append('q', query);
    searchParams.append('type', 'track');
    searchParams.append('limit', limit.toString());
    
    const response = await fetch(`https://api.spotify.com/v1/search?${searchParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Spotify API search error: ${response.status} - ${errorText}`);
      return [];
    }
    
    const data = await response.json();
    
    if (!data.tracks || !data.tracks.items) {
      return [];
    }
    
    return data.tracks.items.map(formatSpotifyTrack);
  } catch (error) {
    console.error("Spotify track search error:", error);
    return [];
  }
}

// Format Spotify track data to our standard format
function formatSpotifyTrack(track) {
  return {
    id: track.id,
    spotify_id: track.id,
    title: track.name,
    name: track.name,
    artist: track.artists.map((artist) => artist.name).join(', '),
    album: track.album.name,
    image: track.album.images[0]?.url || '',
    cover_url: track.album.images[0]?.url || '',
    preview_url: track.preview_url,
    external_url: track.external_urls.spotify,
    platform_url: track.external_urls.spotify,
    popularity: track.popularity,
    duration_ms: track.duration_ms,
    duration: msToMinutesAndSeconds(track.duration_ms),
    platform: 'spotify',
    release_date: track.album.release_date || null
  };
}

// Function to combine and deduplicate tracks
function combineAndDeduplicateTracks(trackArrays) {
  const uniqueTracks = new Map();
  
  // Flatten array if it's an array of arrays
  const flatTracks = Array.isArray(trackArrays[0]) 
    ? trackArrays.flat() 
    : trackArrays;
  
  for (const track of flatTracks) {
    if (!uniqueTracks.has(track.id)) {
      uniqueTracks.set(track.id, track);
    }
  }
  
  return Array.from(uniqueTracks.values());
}

// Function to enrich tracks with audio features
async function enrichTracksWithAudioFeatures(tracks, token) {
  if (tracks.length === 0) return tracks;
  
  try {
    // Get all track IDs
    const trackIds = tracks.map(track => track.id);
    
    // Split into chunks of 100 (Spotify API limit)
    const chunkSize = 100;
    const trackIdChunks = [];
    
    for (let i = 0; i < trackIds.length; i += chunkSize) {
      trackIdChunks.push(trackIds.slice(i, i + chunkSize));
    }
    
    // Fetch audio features for each chunk
    const featuresPromises = trackIdChunks.map(async (chunk) => {
      const response = await fetch(`https://api.spotify.com/v1/audio-features?ids=${chunk.join(',')}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        console.error(`Spotify API error: ${response.status}`);
        return { audio_features: [] };
      }
      
      return response.json();
    });
    
    const featuresResponses = await Promise.all(featuresPromises);
    
    // Flatten all responses into one array of audio features
    let allAudioFeatures = [];
    featuresResponses.forEach(res => {
      if (res && res.audio_features) {
        allAudioFeatures = [...allAudioFeatures, ...res.audio_features.filter(Boolean)];
      }
    });
    
    // Match audio features with tracks
    return tracks.map(track => {
      const features = allAudioFeatures.find(item => item && item.id === track.id);
      
      if (features) {
        return {
          ...track,
          audio_features: {
            bpm: Math.round(features.tempo),
            key: features.key,
            mode: features.mode,
            time_signature: features.time_signature,
            energy: features.energy,
            valence: features.valence,
            danceability: features.danceability,
            acousticness: features.acousticness,
            instrumentalness: features.instrumentalness
          }
        };
      }
      
      return track;
    });
  } catch (error) {
    console.error("Error fetching audio features:", error);
    // Return original tracks if audio features fetch fails
    return tracks;
  }
}

// Generate a playlist name based on intent
function generatePlaylistName(intent) {
  let name = "";
  
  if (intent.genre && intent.genre !== "any") {
    name += intent.genre.charAt(0).toUpperCase() + intent.genre.slice(1) + " ";
  }
  
  if (intent.mood_tags && intent.mood_tags.length > 0) {
    name += intent.mood_tags[0].charAt(0).toUpperCase() + intent.mood_tags[0].slice(1) + " ";
  }
  
  // Add a descriptor based on the style
  switch (intent.style) {
    case "club-ready":
      name += "Club Mix";
      break;
    case "crate-dig":
      name += "Deep Cuts";
      break;
    case "classic":
      name += "Classics";
      break;
    default:
      name += "Playlist";
  }
  
  // If name is too short or generic, add a timestamp
  if (name.length < 10) {
    const date = new Date();
    name += ` - ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }
  
  return name.trim();
}

// Format musical key
function formatKey(key, mode) {
  const KEY_MAPPING = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
  if (key === undefined || mode === undefined || key < 0 || key >= KEY_MAPPING.length) {
    return "Unknown";
  }
  return `${KEY_MAPPING[key]} ${mode === 1 ? "Major" : "Minor"}`;
}

// Helper function to get Spotify token
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

// Function to convert MS to MM:SS format
function msToMinutesAndSeconds(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

// Helper functions for audio feature calculations
function calculateEnergyFromMoods(moods) {
  if (!moods || moods.length === 0) return 0.5;
  
  const energyMap = {
    "energetic": 0.9,
    "happy": 0.7,
    "uplifting": 0.7,
    "dark": 0.6,
    "romantic": 0.4,
    "calm": 0.2,
    "sad": 0.3,
    "nostalgic": 0.5,
    "neutral": 0.5
  };
  
  let totalEnergy = 0;
  let countedMoods = 0;
  
  for (const mood of moods) {
    if (energyMap[mood] !== undefined) {
      totalEnergy += energyMap[mood];
      countedMoods++;
    }
  }
  
  return countedMoods > 0 ? totalEnergy / countedMoods : 0.5;
}

function calculateDanceabilityFromStyle(style) {
  switch (style) {
    case "club-ready":
      return 0.8;
    case "crate-dig":
      return 0.6;
    case "classic":
      return 0.5;
    default:
      return 0.5;
  }
}

function calculateValenceFromMoods(moods) {
  if (!moods || moods.length === 0) return 0.5;
  
  const valenceMap = {
    "happy": 0.9,
    "uplifting": 0.8,
    "energetic": 0.7,
    "nostalgic": 0.6,
    "romantic": 0.6,
    "calm": 0.5,
    "dark": 0.3,
    "sad": 0.2,
    "neutral": 0.5
  };
  
  let totalValence = 0;
  let countedMoods = 0;
  
  for (const mood of moods) {
    if (valenceMap[mood] !== undefined) {
      totalValence += valenceMap[mood];
      countedMoods++;
    }
  }
  
  return countedMoods > 0 ? totalValence / countedMoods : 0.5;
}
