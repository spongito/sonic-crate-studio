
import { formatSpotifyTrack } from './spotify-track-utils.ts';

export async function searchTracks(query: string, intent: any, token: string, limit: number = 50, marketCode?: string) {
  try {
    // Build search query based on intent type
    let searchQuery = '';
    
    switch (intent.intent_type) {
      case 'artist_search': {
        // Build artist search query with OR operators between potential artists
        const possibleArtists = intent.possible_artists || [];
        if (possibleArtists.length > 0) {
          searchQuery = possibleArtists
            .filter((artist: string) => artist && artist.length > 1)
            .map((artist: string) => `artist:"${artist}"`)
            .join(' OR ');
        } else {
          // Fallback to simple query if no artists detected
          searchQuery = query;
        }
        break;
      }
      
      case 'track_search': {
        // Build track search with track and artist if available
        if (intent.possible_tracks && intent.possible_tracks.length > 0) {
          searchQuery = `track:"${intent.possible_tracks[0]}"`;
          
          // Add artist if we have both track and artist
          if (intent.possible_artists && intent.possible_artists.length > 0) {
            searchQuery += ` artist:"${intent.possible_artists[0]}"`;
          }
        } else {
          // Fallback to simple query
          searchQuery = query;
        }
        break;
      }
      
      case 'activity_search':
      case 'theme_search':
      default:
        // For theme and activity searches, use the original query
        // without adding structured filters that might be too restrictive
        searchQuery = query;
        break;
    }
    
    // Add release year filter if specified in the intent
    if (intent.release_year_range) {
      if (intent.release_year_range.min === intent.release_year_range.max) {
        searchQuery += ` year:${intent.release_year_range.min}`;
      } else {
        searchQuery += ` year:${intent.release_year_range.min}-${intent.release_year_range.max}`;
      }
    }
    
    console.log(`Spotify search query: ${searchQuery}`);
    
    // Build query parameters
    const queryParams = new URLSearchParams({
      q: searchQuery,
      type: 'track',
      limit: String(limit),
    });
    
    // Add market parameter if specified
    if (marketCode && marketCode !== 'global') {
      queryParams.append('market', marketCode);
    }
    
    const response = await fetch(
      `https://api.spotify.com/v1/search?${queryParams.toString()}`,
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
      if (!artistName || artistName.length < 2) continue;
      
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
