
import { formatSpotifyTrack } from './spotify-track-utils.ts';

export async function searchTracks(query: string, token: string, limit: number = 20) {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      console.error(`Spotify API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    if (!data.tracks || !data.tracks.items || !Array.isArray(data.tracks.items)) {
      console.error("Unexpected response structure from Spotify search:", data);
      return [];
    }

    return data.tracks.items.map(track => formatSpotifyTrack(track)).filter(Boolean);
  } catch (error) {
    console.error("Spotify track search error:", error);
    return [];
  }
}

export async function searchArtists(artistNames: string[], token: string) {
  try {
    const artistIds = [];
    
    for (const artistName of artistNames) {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        console.error(`Spotify API error for artist ${artistName}: ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      if (data.artists && data.artists.items && data.artists.items.length > 0) {
        artistIds.push(data.artists.items[0].id);
      }
    }
    
    return artistIds;
  } catch (error) {
    console.error("Spotify artist search error:", error);
    return [];
  }
}
