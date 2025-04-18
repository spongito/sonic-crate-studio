
import { formatSpotifyTrack } from './spotify-track-utils.ts';

export async function getRecommendations(seedTracks: string[], seedArtists: string[], intent: any, token: string) {
  try {
    if (seedTracks.length === 0 && seedArtists.length === 0) {
      console.warn("No seed tracks or artists available for recommendations");
      return [];
    }
    
    let url = 'https://api.spotify.com/v1/recommendations?limit=30';
    
    // Add seed tracks
    if (seedTracks.length > 0) {
      url += `&seed_tracks=${seedTracks.slice(0, 2).join(',')}`;
    }
    
    // Add seed artists
    if (seedArtists.length > 0) {
      const artistCount = seedTracks.length > 0 ? 3 - seedTracks.length : 2;
      if (artistCount > 0) {
        url += `&seed_artists=${seedArtists.slice(0, artistCount).join(',')}`;
      }
    }
    
    // Add target attributes from intent
    if (intent.energy !== undefined) {
      url += `&target_energy=${intent.energy}`;
    }
    
    if (intent.danceability !== undefined) {
      url += `&target_danceability=${intent.danceability}`;
    }
    
    if (intent.valence !== undefined) {
      url += `&target_valence=${intent.valence}`;
    }
    
    if (intent.tempo_range && intent.tempo_range.min && intent.tempo_range.max) {
      const avgTempo = (intent.tempo_range.min + intent.tempo_range.max) / 2;
      url += `&target_tempo=${avgTempo}`;
    }
    
    if (intent.style === 'club-ready') {
      url += '&min_energy=0.6&min_danceability=0.6';
    } else if (intent.style === 'crate-dig') {
      url += '&max_popularity=50';
    }
    
    console.log("Recommendations URL:", url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      console.error(`Spotify API error for recommendations: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    if (!data.tracks || !Array.isArray(data.tracks)) {
      console.error("Unexpected response structure from Spotify recommendations:", data);
      return [];
    }
    
    return data.tracks.map(track => formatSpotifyTrack(track)).filter(Boolean);
  } catch (error) {
    console.error("Spotify recommendations error:", error);
    return [];
  }
}
