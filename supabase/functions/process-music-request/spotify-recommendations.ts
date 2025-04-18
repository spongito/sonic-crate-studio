
export async function getRecommendations(seedTracks: string[], seedArtists: string[], intent: any, token: string) {
  try {
    const params = new URLSearchParams();
    
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
    
    params.append('limit', '50');
    
    if (intent.energy !== undefined) params.append('target_energy', intent.energy.toString());
    if (intent.danceability !== undefined) params.append('target_danceability', intent.danceability.toString());
    if (intent.valence !== undefined) params.append('target_valence', intent.valence.toString());
    
    if (intent.tempo_range && intent.tempo_range.min) params.append('min_tempo', intent.tempo_range.min.toString());
    if (intent.tempo_range && intent.tempo_range.max) params.append('max_tempo', intent.tempo_range.max.toString());
    
    const targetPopularity = Math.round((1 - intent.obscurity) * 100);
    params.append('target_popularity', targetPopularity.toString());
    
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
