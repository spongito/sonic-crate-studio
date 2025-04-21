
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
      
      // Modified to handle reference artists with higher priority
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
      
      // Build an advanced Spotify query string with structured filters
      let searchQuery = intent.original_prompt;
      let queryParams = [];

      // Add artist name if available in reference_artists
      if (intent.reference_artists && intent.reference_artists.length > 0 && intent.activeFilters?.references) {
        queryParams.push(`artist:${intent.reference_artists[0]}`);
      }
      
      // Add genre filter if specified
      if (intent.genre && intent.genre !== "any" && intent.activeFilters?.genre) {
        queryParams.push(`genre:${intent.genre}`);
      }
      
      // Add year range if specified
      if (intent.release_year_range && intent.activeFilters?.releaseYear) {
        queryParams.push(`year:${intent.release_year_range.min}-${intent.release_year_range.max}`);
      }
      
      // Combine all parameters into the search query
      if (queryParams.length > 0) {
        searchQuery = `${searchQuery} ${queryParams.join(' ')}`;
      }
      
      console.log(`Using Spotify search query: ${searchQuery}`);

      // Increased limit to 50 tracks per platform as requested
      const searchResults = await searchTracks(searchQuery, token, 50, intent.locations?.[0]);
      if (searchResults.length > 0) {
        allTracks.push(...searchResults);
        
        if (seedTracks.length < 5) {
          const additionalSeeds = getSeedTracks(searchResults, 5 - seedTracks.length);
          seedTracks = [...seedTracks, ...additionalSeeds];
        }
      } else {
        console.warn("No tracks found for main search query");
        
        // If no results, try a broader search without structured parameters
        const broadSearchQuery = intent.original_prompt;
        console.log(`Trying broader Spotify search: ${broadSearchQuery}`);
        const broadSearchResults = await searchTracks(broadSearchQuery, token, 50, intent.locations?.[0]);
        allTracks.push(...broadSearchResults);
        
        if (seedTracks.length < 5 && broadSearchResults.length > 0) {
          const additionalSeeds = getSeedTracks(broadSearchResults, 5 - seedTracks.length);
          seedTracks = [...seedTracks, ...additionalSeeds];
        }
      }
    }
    
    if (enabledPlatforms.has('youtube')) {
      console.log("Performing YouTube search...");
      
      // Build a more advanced YouTube query
      let youtubeQuery = intent.original_prompt;
      let queryComponents = [];
      
      // Add artists if references are enabled
      if (intent.reference_artists && intent.reference_artists.length > 0 && intent.activeFilters?.references) {
        queryComponents.push(intent.reference_artists[0]);
      }
      
      // Add genre if specified
      if (intent.genre && intent.genre !== "any" && intent.activeFilters?.genre) {
        queryComponents.push(intent.genre);
      }
      
      // Add year range if specified (will be filtered post-fetch)
      if (intent.release_year_range && intent.activeFilters?.releaseYear) {
        if (intent.release_year_range.min === intent.release_year_range.max) {
          queryComponents.push(intent.release_year_range.min.toString());
        } else {
          queryComponents.push(`${intent.release_year_range.min}-${intent.release_year_range.max}`);
        }
      }
      
      // Add tempo/bpm indicator if specified (not directly queryable)
      if (intent.tempo) {
        queryComponents.push(intent.tempo);
      }
      
      // Add "audio" and "topic" to focus on audio-only content
      queryComponents.push("audio");
      
      // Build the final query
      if (queryComponents.length > 0) {
        youtubeQuery = `${youtubeQuery} ${queryComponents.join(' ')}`;
      }
      
      console.log(`Using YouTube query: ${youtubeQuery}`);
      
      // Set the region code if location is specified
      const regionCode = intent.locations && intent.locations[0] !== 'global' ? intent.locations[0] : undefined;
      
      try {
        // Increased limit to 50 tracks per platform as requested
        const youtubeResults = await searchYouTubeVideos(youtubeQuery, 50, regionCode);
        console.log(`Found ${youtubeResults.length} YouTube tracks`);
        
        if (youtubeResults.length > 0) {
          // If year filter is active, filter YouTube results by year
          if (intent.release_year_range && intent.activeFilters?.releaseYear) {
            const filteredResults = youtubeResults.filter(track => {
              const publishYear = track.release_year;
              return publishYear ? (
                publishYear >= intent.release_year_range.min && 
                publishYear <= intent.release_year_range.max
              ) : true;
            });
            
            console.log(`After year filtering: ${filteredResults.length} YouTube tracks`);
            allTracks.push(...filteredResults);
          } else {
            allTracks.push(...youtubeResults);
          }
        } else {
          // Try a simpler query as fallback if first search returned nothing
          const simplifiedQuery = intent.original_prompt;
          console.log(`Trying simplified YouTube query: ${simplifiedQuery}`);
          const fallbackResults = await searchYouTubeVideos(simplifiedQuery, 50);
          console.log(`Found ${fallbackResults.length} YouTube tracks from fallback query`);
          
          if (fallbackResults.length > 0) {
            allTracks.push(...fallbackResults);
          }
        }
      } catch (error) {
        console.error("YouTube API error:", error);
        
        // Only rethrow if YouTube is the only platform and we have no tracks
        if (enabledPlatforms.size === 1 && allTracks.length === 0) {
          // Provide a user-friendly error message
          throw new Error(`YouTube search failed: ${error.message}`);
        }
      }
    }
    
    // Handle case where no tracks are found
    if (allTracks.length === 0) {
      if (enabledPlatforms.has('youtube') && enabledPlatforms.size === 1) {
        throw new Error("No YouTube tracks found. The YouTube API may be unavailable or the API key may be invalid. Try enabling Spotify as well or using a different search term.");
      } else if (enabledPlatforms.has('spotify') && enabledPlatforms.size === 1) {
        throw new Error("No Spotify tracks found. Try a different search term or enable YouTube as an additional source.");
      } else {
        throw new Error("No tracks found from any platform. Try a different search term or check your platform settings.");
      }
    }
    
    // Deduplicate and combine tracks
    allTracks = combineAndDeduplicateTracks(allTracks);
    console.log(`Combined and deduplicated: ${allTracks.length} total tracks`);
    
    // Save tracks to database
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
