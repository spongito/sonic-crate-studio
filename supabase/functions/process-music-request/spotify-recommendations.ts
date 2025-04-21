
import { formatSpotifyTrack } from './spotify-track-utils.ts';

export async function getRecommendations(seedTracks: string[], seedArtists: string[], intent: any, token: string) {
  try {
    if (seedTracks.length === 0 && seedArtists.length === 0) {
      console.warn("No seed tracks or artists available for recommendations");
      return [];
    }
    
    const queryParams = new URLSearchParams();
    queryParams.append('limit', '30');
    
    // Add seed tracks
    if (seedTracks.length > 0) {
      queryParams.append('seed_tracks', seedTracks.slice(0, Math.min(seedTracks.length, 2)).join(','));
    }
    
    // Add seed artists
    if (seedArtists.length > 0) {
      const artistCount = seedTracks.length > 0 ? Math.min(5 - seedTracks.length, seedArtists.length) : Math.min(2, seedArtists.length);
      if (artistCount > 0) {
        queryParams.append('seed_artists', seedArtists.slice(0, artistCount).join(','));
      }
    }
    
    // Add seed genres if space allows and we have diaspora or detected genres
    const seedGenreSlots = 5 - (seedTracks.length + Math.min(seedArtists.length, 5 - seedTracks.length));
    if (seedGenreSlots > 0) {
      // Prioritize genres from GPT analysis or activity mapping
      let genresToUse = [];
      
      if (intent.genres && intent.genres.length > 0) {
        genresToUse = intent.genres;
      } else if (intent.suggested_genres && intent.suggested_genres.length > 0) {
        genresToUse = intent.suggested_genres;
      } else if (intent.genre && intent.genre !== "any") {
        genresToUse = [intent.genre];
      }
      
      // Spotify requires lowercase genres with no spaces
      const formattedGenres = genresToUse
        .slice(0, seedGenreSlots)
        .map(g => g.toLowerCase().replace(/\s+/g, '-'))
        .join(',');
        
      if (formattedGenres) {
        queryParams.append('seed_genres', formattedGenres);
      }
    }
    
    // Add target audio features based on intent
    if (intent.energy !== undefined) {
      queryParams.append('target_energy', intent.energy.toString());
    }
    
    if (intent.danceability !== undefined) {
      queryParams.append('target_danceability', intent.danceability.toString());
    }
    
    if (intent.valence !== undefined) {
      queryParams.append('target_valence', intent.valence.toString());
    }
    
    // Add BPM/tempo target if available
    if (intent.bpm_range) {
      const avgTempo = (intent.bpm_range.min + intent.bpm_range.max) / 2;
      queryParams.append('target_tempo', avgTempo.toString());
      
      // For more precise BPM matching, set min_tempo and max_tempo
      queryParams.append('min_tempo', intent.bpm_range.min.toString());
      queryParams.append('max_tempo', intent.bpm_range.max.toString());
    } else if (intent.tempo_range && intent.tempo_range.min && intent.tempo_range.max) {
      const avgTempo = (intent.tempo_range.min + intent.tempo_range.max) / 2;
      queryParams.append('target_tempo', avgTempo.toString());
    }
    
    // Apply style-specific settings
    if (intent.style === 'club-ready') {
      queryParams.append('min_energy', '0.6');
      queryParams.append('min_danceability', '0.6');
    } else if (intent.style === 'crate-dig') {
      queryParams.append('max_popularity', '50');
    }
    
    // Add popularity target based on commercial factor
    if (intent.commercialFactor !== undefined) {
      const targetPopularity = intent.commercialFactor;
      queryParams.append('target_popularity', targetPopularity.toString());
    }
    
    // Construct the full URL
    const url = `https://api.spotify.com/v1/recommendations?${queryParams.toString()}`;
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
