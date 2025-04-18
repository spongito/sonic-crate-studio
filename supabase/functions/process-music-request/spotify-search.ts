
export async function searchTracks(query: string, token: string, limit = 20) {
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

export async function searchArtists(artistNames: string[], token: string) {
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
