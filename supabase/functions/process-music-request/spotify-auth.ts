
import { corsHeaders } from './cors.ts';

export async function getSpotifyToken() {
  const spotifyClientId = Deno.env.get('SPOTIFY_CLIENT_ID');
  const spotifyClientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET');

  if (!spotifyClientId || !spotifyClientSecret) {
    throw new Error("Spotify credentials are not configured");
  }

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
      throw new Error(`Spotify authentication failed: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    if (!data.access_token) {
      throw new Error("Invalid response from Spotify authentication");
    }
    
    return data.access_token;
  } catch (error) {
    console.error("Spotify token error:", error);
    throw new Error("Failed to authenticate with Spotify: " + error.message);
  }
}
