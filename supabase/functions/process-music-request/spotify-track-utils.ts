
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
      console.log(`Fetching audio features for ${chunk.length} tracks`);
      const response = await fetch(`https://api.spotify.com/v1/audio-features?ids=${chunk.join(',')}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        console.error(`Spotify API error when fetching audio features: ${response.status}`);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        return { audio_features: [] };
      }
      
      const data = await response.json();
      console.log(`Received audio features for ${data.audio_features?.filter(Boolean).length || 0} tracks`);
      return data;
    });
    
    const featuresResponses = await Promise.all(featuresPromises);
    
    let allAudioFeatures: any[] = [];
    featuresResponses.forEach(res => {
      if (res && res.audio_features) {
        allAudioFeatures = [...allAudioFeatures, ...res.audio_features.filter(Boolean)];
      }
    });
    
    console.log(`Total audio features retrieved: ${allAudioFeatures.length} out of ${tracks.length} tracks`);
    
    return tracks.map(track => {
      const features = allAudioFeatures.find(item => item && item.id === track.id);
      
      if (features) {
        const keySignature = formatKeySignature(features.key, features.mode);
        console.log(`Enriching track ${track.name || track.title} with audio features: BPM=${Math.round(features.tempo)}, Key=${keySignature}`);
        
        return {
          ...track,
          audio_features: {
            bpm: Math.round(features.tempo),
            key: features.key,
            mode: features.mode,
            key_signature: keySignature,
            time_signature: features.time_signature,
            energy: features.energy,
            valence: features.valence,
            danceability: features.danceability,
            acousticness: features.acousticness,
            instrumentalness: features.instrumentalness
          }
        };
      }
      
      console.log(`No audio features found for track: ${track.name || track.title}`);
      return track;
    });
  } catch (error) {
    console.error("Error fetching audio features:", error);
    return tracks;
  }
}

export function formatSpotifyTrack(track: any) {
  if (!track || !track.id) {
    console.error("Invalid track data received:", track);
    return null;
  }
  
  // Extract year from release_date
  const releaseYear = track.album.release_date 
    ? parseInt(track.album.release_date.split('-')[0])
    : null;

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
    release_year: releaseYear,
    genre: [], // Will be populated by enrichment process
    release_date: track.album.release_date || null
  };
}

function msToMinutesAndSeconds(ms: number) {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

function formatKeySignature(key: number, mode: number): string {
  if (key === undefined || mode === undefined || key < 0 || key > 11) {
    return "Unknown";
  }
  
  const keys = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
  const modes = ["Minor", "Major"];
  
  return `${keys[key]} ${modes[mode]}`;
}
