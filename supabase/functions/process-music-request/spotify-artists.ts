
export async function getArtistTopTracks(artistIds: string[], token: string) {
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

export async function getRelatedArtists(artistId: string, token: string) {
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
