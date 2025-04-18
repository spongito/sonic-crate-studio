
import { corsHeaders } from './cors.ts';

export async function getSpotifyToken() {
  const spotifyClientId = Deno.env.get('SPOTIFY_CLIENT_ID');
  const spotifyClientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET');

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
      throw new Error(`Spotify auth error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Spotify token error:", error);
    throw new Error("Failed to get Spotify access token: " + error.message);
  }
}

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

export async function enrichTracksWithAudioFeatures(tracks: any[], token: string) {
  if (tracks.length === 0) return tracks;
  
  try {
    const trackIds = tracks.map(track => track.id);
    const chunkSize = 100;
    const trackIdChunks = [];
    
    for (let i = 0; i < trackIds.length; i += chunkSize) {
      trackIdChunks.push(trackIds.slice(i, i + chunkSize));
    }
    
    const featuresPromises = trackIdChunks.map(async (chunk) => {
      const response = await fetch(`https://api.spotify.com/v1/audio-features?ids=${chunk.join(',')}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        console.error(`Spotify API error: ${response.status}`);
        return { audio_features: [] };
      }
      
      return response.json();
    });
    
    const featuresResponses = await Promise.all(featuresPromises);
    
    let allAudioFeatures: any[] = [];
    featuresResponses.forEach(res => {
      if (res && res.audio_features) {
        allAudioFeatures = [...allAudioFeatures, ...res.audio_features.filter(Boolean)];
      }
    });
    
    return tracks.map(track => {
      const features = allAudioFeatures.find(item => item && item.id === track.id);
      
      if (features) {
        return {
          ...track,
          audio_features: {
            bpm: Math.round(features.tempo),
            key: features.key,
            mode: features.mode,
            time_signature: features.time_signature,
            energy: features.energy,
            valence: features.valence,
            danceability: features.danceability,
            acousticness: features.acousticness,
            instrumentalness: features.instrumentalness
          }
        };
      }
      
      return track;
    });
  } catch (error) {
    console.error("Error fetching audio features:", error);
    return tracks;
  }
}

export function formatSpotifyTrack(track: any) {
  return {
    id: track.id,
    spotify_id: track.id,
    title: track.name,
    name: track.name,
    artist: track.artists.map((artist: any) => artist.name).join(', '),
    album: track.album.name,
    image: track.album.images[0]?.url || '',
    cover_url: track.album.images[0]?.url || '',
    preview_url: track.preview_url,
    external_url: track.external_urls.spotify,
    platform_url: track.external_urls.spotify,
    popularity: track.popularity,
    duration_ms: track.duration_ms,
    duration: msToMinutesAndSeconds(track.duration_ms),
    platform: 'spotify',
    release_date: track.album.release_date || null
  };
}

function msToMinutesAndSeconds(ms: number) {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}
