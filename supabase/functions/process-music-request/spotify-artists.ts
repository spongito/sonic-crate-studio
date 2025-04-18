
import { formatSpotifyTrack } from './spotify-track-utils.ts';

export async function getArtistTopTracks(artistIds: string[], token: string) {
  try {
    const allTracks = [];
    
    for (const artistId of artistIds) {
      const response = await fetch(
        `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        console.error(`Spotify API error for artist ${artistId}: ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      if (data.tracks && Array.isArray(data.tracks)) {
        const formattedTracks = data.tracks.map(track => formatSpotifyTrack(track)).filter(Boolean);
        allTracks.push(...formattedTracks);
      }
    }
    
    return allTracks;
  } catch (error) {
    console.error("Error fetching artist top tracks:", error);
    return [];
  }
}

export async function getRelatedArtists(artistId: string, token: string) {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}/related-artists`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (!response.ok) {
      console.error(`Spotify API error for related artists: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    if (!data.artists || !Array.isArray(data.artists)) {
      return [];
    }
    
    return data.artists.map(artist => artist.id);
  } catch (error) {
    console.error("Error fetching related artists:", error);
    return [];
  }
}
