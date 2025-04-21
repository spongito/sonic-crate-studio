import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CLIENT_ID = Deno.env.get("SPOTIFY_CLIENT_ID") || "";
const CLIENT_SECRET = Deno.env.get("SPOTIFY_CLIENT_SECRET") || "";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Missing Spotify credentials. Make sure SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET are set.");
}

// Create Supabase client for internal operations
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

async function getSpotifyToken() {
  try {
    // Check if we have a valid cached token
    const { data: tokenData } = await supabase
      .from('system_config')
      .select('value, updated_at')
      .eq('key', 'spotify_token')
      .maybeSingle();
    
    const now = new Date();
    const tokenExpiry = tokenData?.updated_at ? new Date(tokenData.updated_at) : null;
    
    // If token exists and is less than 50 minutes old (tokens are valid for 60 minutes)
    if (tokenData?.value && tokenExpiry && 
        (now.getTime() - tokenExpiry.getTime() < 50 * 60 * 1000)) {
      return tokenData.value;
    }
    
    // Otherwise get a new token
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`
      },
      body: 'grant_type=client_credentials'
    });
    
    if (!response.ok) {
      throw new Error(`Spotify auth failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const token = data.access_token;
    
    // Save the new token
    await supabase
      .from('system_config')
      .upsert({ 
        key: 'spotify_token',
        value: token,
        updated_at: new Date().toISOString()
      });
    
    return token;
  } catch (error) {
    console.error("Error getting Spotify token:", error);
    throw error;
  }
}

async function searchSpotify(query: string, token: string) {
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist,track&limit=5`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Spotify API error: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  const results = [];

  // Process artists
  if (data.artists && data.artists.items) {
    for (const artist of data.artists.items) {
      results.push({
        id: artist.id,
        name: artist.name,
        type: "artist",
        imageUrl: artist.images && artist.images[0] ? artist.images[0].url : undefined
      });
    }
  }

  // Process tracks
  if (data.tracks && data.tracks.items) {
    for (const track of data.tracks.items) {
      results.push({
        id: track.id,
        name: track.name,
        type: "track",
        imageUrl: track.album && track.album.images && track.album.images[0] 
          ? track.album.images[0].url 
          : undefined,
        artistName: track.artists && track.artists[0] ? track.artists[0].name : undefined
      });
    }
  }

  return results;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const body = await req.json();
    const { query } = body;

    if (!query || typeof query !== 'string') {
      return new Response(JSON.stringify({ error: 'Query parameter is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const spotifyToken = await getSpotifyToken();
    const searchResults = await searchSpotify(query, spotifyToken);

    return new Response(JSON.stringify(searchResults), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
