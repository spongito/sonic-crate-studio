import { searchTracks, searchArtists, getArtistTopTracks, getRelatedArtists } from './spotify-client.ts';
import { searchYouTubeVideos } from './youtube-client.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

async function saveMasterTrack(track: any, audioFeatures: any) {
  try {
    console.log('Attempting to save track with audio features:', {
      id: track.id,
      title: track.title || track.name,
      artist: Array.isArray(track.artist) ? track.artist : [track.artist],
      audioFeatures: audioFeatures ? 'present' : 'missing'
    });
    
    if (!track.spotify_id) {
      console.error('Cannot save track without spotify_id:', track);
      return null;
    }
    
    const { data: existingTrack, error: checkError } = await supabase
      .from('tracks_master')
      .select('id, bpm, key_signature')
      .eq('spotify_id', track.spotify_id)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking for existing track:', checkError);
      return null;
    }

    let bpm = null;
    let keySignature = null;
    let energy = null;
    let danceability = null;
    let valence = null;
    let instrumentalness = null;
    let acousticness = null;
    
    if (audioFeatures) {
      if (audioFeatures.tempo !== undefined) {
        bpm = Math.round(audioFeatures.tempo);
      }
      
      if (audioFeatures.key !== undefined && audioFeatures.mode !== undefined) {
        keySignature = formatKey(audioFeatures.key, audioFeatures.mode);
      }
      
      energy = audioFeatures.energy;
      danceability = audioFeatures.danceability;
      valence = audioFeatures.valence;
      instrumentalness = audioFeatures.instrumentalness;
      acousticness = audioFeatures.acousticness;
    } 
    else if (track.audio_features) {
      if (track.audio_features.bpm !== undefined) {
        bpm = track.audio_features.bpm;
      } else if (track.audio_features.tempo !== undefined) {
        bpm = Math.round(track.audio_features.tempo);
      }
      
      if (track.audio_features.key !== undefined && track.audio_features.mode !== undefined) {
        keySignature = formatKey(track.audio_features.key, track.audio_features.mode);
      } else if (track.audio_features.key_signature) {
        keySignature = track.audio_features.key_signature;
      }
      
      energy = track.audio_features.energy;
      danceability = track.audio_features.danceability;
      valence = track.audio_features.valence;
      instrumentalness = track.audio_features.instrumentalness;
      acousticness = track.audio_features.acousticness;
    }

    if (existingTrack) {
      console.log(`Track ${track.title || track.name} already exists with ID ${existingTrack.id}`);
      
      if (audioFeatures && (!existingTrack.bpm || !existingTrack.key_signature)) {
        console.log(`Updating existing track ${existingTrack.id} with audio features`);
        
        const { error: updateError } = await supabase
          .from('tracks_master')
          .update({
            bpm,
            key_signature: keySignature,
            energy,
            danceability,
            valence,
            instrumentalness,
            acousticness,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingTrack.id);
          
        if (updateError) {
          console.error('Error updating track with audio features:', updateError);
        }
      }
      
      return existingTrack.id;
    }
    
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
      energy: energy,
      danceability: danceability,
      valence: valence,
      instrumentalness: instrumentalness,
      acousticness: acousticness
    };

    console.log('Track data prepared for insertion:', {
      ...trackData,
      bpm_present: bpm !== null,
      key_present: keySignature !== null
    });

    const { data: newTrack, error } = await supabase
      .from('tracks_master')
      .insert(trackData)
      .select('id')
      .single();

    if (error) {
      console.error('Error saving track to master database:', error);
      return null;
    }

    console.log(`Successfully saved track ${track.title || track.name} with ID ${newTrack.id}`);
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

export async function executeSearchFlow(intent: any, token: string | null, platforms: string[] = ['spotify', 'youtube']) {
  let allTracks = [];
  let seedTracks = [];
  let seedArtists = [];
  const enabledPlatforms = new Set(platforms);
  
  console.log(`Executing search flow with platforms: ${Array.from(enabledPlatforms).join(', ')}`);
  
  try {
    if (enabledPlatforms.has('spotify') && token) {
      console.log("Performing Spotify search...");
      
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
      
      if (allTracks.length < 10) {
        const broadSearchQuery = intent.mood_tags.join(' ') + ' ' + (intent.genre || '');
        const broadSearchResults = await searchTracks(broadSearchQuery, token, 30);
        allTracks.push(...broadSearchResults);
        
        if (seedTracks.length < 5 && broadSearchResults.length > 0) {
          const additionalSeeds = getSeedTracks(broadSearchResults, 5 - seedTracks.length);
          seedTracks = [...seedTracks, ...additionalSeeds];
        }
      }
    }
    
    if (enabledPlatforms.has('youtube')) {
      console.log("Performing YouTube search...");
      
      let youtubeGenre = intent.genre && intent.genre !== "any" ? intent.genre : "";
      let youtubeMoods = intent.mood_tags.slice(0, 2).join(' ');
      let youtubeArtists = "";
      
      if (intent.reference_artists && intent.reference_artists.length > 0) {
        youtubeArtists = intent.reference_artists.slice(0, 2).join(' ');
      }
      
      // Create a well-formed YouTube query
      let youtubeQuery = intent.original_prompt;
      
      // Add specific components if they're not already in the original prompt
      if (youtubeGenre && !youtubeQuery.toLowerCase().includes(youtubeGenre.toLowerCase())) {
        youtubeQuery += ` ${youtubeGenre}`;
      }
      
      if (youtubeArtists && !youtubeQuery.toLowerCase().includes(youtubeArtists.toLowerCase())) {
        youtubeQuery += ` ${youtubeArtists}`;
      }
      
      if (youtubeMoods && !youtubeQuery.toLowerCase().includes(youtubeMoods.toLowerCase())) {
        youtubeQuery += ` ${youtubeMoods}`;
      }
      
      if (intent.tempo && !youtubeQuery.toLowerCase().includes(intent.tempo.toLowerCase())) {
        youtubeQuery += ` ${intent.tempo}`;
      }
      
      console.log(`Using YouTube query: ${youtubeQuery}`);
      
      const youtubeResults = await searchYouTubeVideos(youtubeQuery, 30);
      console.log(`Found ${youtubeResults.length} YouTube tracks`);
      
      if (youtubeResults.length > 0) {
        allTracks.push(...youtubeResults);
      } else {
        // Try a simpler query as fallback if first search returned nothing
        const simplifiedQuery = intent.original_prompt;
        console.log(`Trying simplified YouTube query: ${simplifiedQuery}`);
        const fallbackResults = await searchYouTubeVideos(simplifiedQuery, 30);
        console.log(`Found ${fallbackResults.length} YouTube tracks from fallback query`);
        
        if (fallbackResults.length > 0) {
          allTracks.push(...fallbackResults);
        }
      }
    }
    
    if (allTracks.length === 0) {
      if (enabledPlatforms.has('youtube') && enabledPlatforms.size === 1) {
        throw new Error("No YouTube tracks found. The YouTube API may be unavailable or the API key may be invalid. Try enabling Spotify as well or using a different search term.");
      } else if (enabledPlatforms.has('spotify') && enabledPlatforms.size === 1) {
        throw new Error("No Spotify tracks found. Try a different search term or enable YouTube as an additional source.");
      } else {
        throw new Error("No tracks found from any platform. Try a different search term or check your platform settings.");
      }
    }
    
    allTracks = combineAndDeduplicateTracks(allTracks);
    console.log(`Combined and deduplicated: ${allTracks.length} total tracks`);
    
    try {
      console.log(`Saving ${allTracks.length} tracks to master database...`);
      for (const track of allTracks) {
        if (track.audio_features && track.spotify_id) {
          await saveMasterTrack(track, track.audio_features);
        } else {
          if (track.spotify_id) {
            console.log(`Track ${track.title || track.name} has no audio features, saving with limited data`);
            await saveMasterTrack(track, null);
          }
        }
      }
    } catch (saveError) {
      console.error("Error saving tracks to database:", saveError);
      // Continue with the flow even if saving fails
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
  if (!tracks || tracks.length === 0) {
    return [];
  }
  
  const filteredTracks = tracks.filter(track => track && track.id);
  if (filteredTracks.length === 0) {
    return [];
  }
  
  const sortedTracks = [...filteredTracks].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  return sortedTracks.slice(0, count).map(track => track.id);
}

function combineAndDeduplicateTracks(trackArrays: any[]) {
  const uniqueTracks = new Map();
  
  const flatTracks = Array.isArray(trackArrays[0]) 
    ? trackArrays.flat() 
    : trackArrays;
  
  for (const track of flatTracks) {
    if (!track) continue;
    
    const trackId = track.id || track.youtube_id || track.spotify_id;
    if (!uniqueTracks.has(trackId)) {
      uniqueTracks.set(trackId, track);
    }
  }
  
  return Array.from(uniqueTracks.values());
}
