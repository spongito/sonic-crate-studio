
import { searchTracks, searchArtists, getArtistTopTracks, getRelatedArtists } from './spotify-client.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

async function saveMasterTrack(track: any, audioFeatures: any) {
  try {
    // Debug log to see what we're trying to insert
    console.log('Attempting to save track:', {
      id: track.id,
      spotify_id: track.spotify_id,
      title: track.title || track.name,
      artist: Array.isArray(track.artist) ? track.artist : [track.artist]
    });
    
    if (!track.spotify_id) {
      console.error('Cannot save track without spotify_id:', track);
      return null;
    }
    
    // Check if track already exists
    const { data: existingTrack, error: checkError } = await supabase
      .from('tracks_master')
      .select('id')
      .eq('spotify_id', track.spotify_id)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking for existing track:', checkError);
      return null;
    }

    if (existingTrack) {
      console.log(`Track ${track.title} already exists with ID ${existingTrack.id}`);
      return existingTrack.id;
    }
    
    // Extract BPM and key from audio features if available
    let bpm = null;
    let keySignature = null;
    
    if (audioFeatures) {
      if (audioFeatures.tempo) {
        bpm = Math.round(audioFeatures.tempo);
      } else if (track.audio_features?.bpm) {
        bpm = track.audio_features.bpm;
      }
      
      if (audioFeatures.key !== undefined && audioFeatures.mode !== undefined) {
        keySignature = formatKey(audioFeatures.key, audioFeatures.mode);
      } else if (track.audio_features?.key !== undefined && track.audio_features?.mode !== undefined) {
        keySignature = formatKey(track.audio_features.key, track.audio_features.mode);
      }
    }
    
    // Prepare data for insertion
    const trackData = {
      spotify_id: track.spotify_id,
      title: track.title || track.name,
      artist: Array.isArray(track.artist) ? track.artist : [track.artist],
      album: track.album,
      image_url: track.image || track.cover_url,
      platform: 'spotify',
      external_url: track.external_url,
      preview_url: track.preview_url,
      popularity: track.popularity,
      bpm: bpm,
      key_signature: keySignature,
      energy: audioFeatures?.energy || track.audio_features?.energy,
      danceability: audioFeatures?.danceability || track.audio_features?.danceability,
      valence: audioFeatures?.valence || track.audio_features?.valence,
      instrumentalness: audioFeatures?.instrumentalness || track.audio_features?.instrumentalness,
      acousticness: audioFeatures?.acousticness || track.audio_features?.acousticness
    };

    console.log('Track data prepared for insertion:', trackData);

    // Insert new track with audio features
    const { data: newTrack, error } = await supabase
      .from('tracks_master')
      .insert(trackData)
      .select('id')
      .single();

    if (error) {
      console.error('Error saving track to master database:', error);
      return null;
    }

    console.log(`Successfully saved track ${track.title} with ID ${newTrack.id}`);
    return newTrack.id;
  } catch (error) {
    console.error('Error in saveMasterTrack:', error);
    return null;
  }
}

function formatKey(key: number, mode: number) {
  const notes = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
  if (key === undefined || mode === undefined || key < 0 || key >= notes.length) {
    return "Unknown";
  }
  return `${notes[key]} ${mode === 1 ? "Major" : "Minor"}`;
}

export async function executeSearchFlow(intent: any, token: string) {
  let allTracks = [];
  let seedTracks = [];
  let seedArtists = [];
  
  try {
    // Artist-based search
    if (intent.reference_artists && intent.reference_artists.length > 0) {
      const artistIds = await searchArtists(intent.reference_artists, token);
      if (artistIds.length === 0) {
        console.warn("No artists found for the given references");
      } else {
        seedArtists = artistIds.slice(0, 2);
        
        const artistTracks = await getArtistTopTracks(artistIds.slice(0, 3), token);
        allTracks.push(...artistTracks);
        seedTracks = getSeedTracks(artistTracks, 3);
        
        if (artistIds[0]) {
          const relatedArtistIds = await getRelatedArtists(artistIds[0], token);
          if (relatedArtistIds.length > 0) {
            const relatedTracks = await getArtistTopTracks(relatedArtistIds.slice(0, 2), token);
            allTracks.push(...relatedTracks);
          }
        }
      }
    }
    
    // Text-based search
    let searchQuery = intent.original_prompt;
    if (intent.genre && intent.genre !== "any") {
      searchQuery += ` genre:${intent.genre}`;
    }
    
    const searchResults = await searchTracks(searchQuery, token, 30);
    if (searchResults.length > 0) {
      allTracks.push(...searchResults);
      
      if (seedTracks.length < 5) {
        const additionalSeeds = getSeedTracks(searchResults, 5 - seedTracks.length);
        seedTracks = [...seedTracks, ...additionalSeeds];
      }
    } else {
      console.warn("No tracks found for main search query");
    }
    
    // Fallback search if needed
    if (allTracks.length < 10) {
      const broadSearchQuery = intent.mood_tags.join(' ') + ' ' + (intent.genre || '');
      const broadSearchResults = await searchTracks(broadSearchQuery, token, 30);
      allTracks.push(...broadSearchResults);
      
      if (seedTracks.length < 5 && broadSearchResults.length > 0) {
        const additionalSeeds = getSeedTracks(broadSearchResults, 5 - seedTracks.length);
        seedTracks = [...seedTracks, ...additionalSeeds];
      }
    }
    
    allTracks = combineAndDeduplicateTracks(allTracks);
    
    // Save tracks to master database
    console.log(`Saving ${allTracks.length} tracks to master database...`);
    for (const track of allTracks) {
      if (track.audio_features) {
        await saveMasterTrack(track, track.audio_features);
      } else {
        console.log(`Track ${track.title || track.name} has no audio features, saving with limited data`);
        await saveMasterTrack(track, null);
      }
    }
    
    return { 
      tracks: allTracks,
      seedTracks: seedTracks.slice(0, 5),
      seedArtists: seedArtists.slice(0, 5)
    };
  } catch (error) {
    console.error("Error in search flow:", error);
    throw new Error("Failed to execute search flow: " + error.message);
  }
}

function getSeedTracks(tracks: any[], count: number) {
  const sortedTracks = [...tracks].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  return sortedTracks.slice(0, count).map(track => track.id);
}

function combineAndDeduplicateTracks(trackArrays: any[]) {
  const uniqueTracks = new Map();
  
  const flatTracks = Array.isArray(trackArrays[0]) 
    ? trackArrays.flat() 
    : trackArrays;
  
  for (const track of flatTracks) {
    if (!uniqueTracks.has(track.id)) {
      uniqueTracks.set(track.id, track);
    }
  }
  
  return Array.from(uniqueTracks.values());
}
