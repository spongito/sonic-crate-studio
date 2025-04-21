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

      let isArtistPrompt = false;
      let searchQuery = intent.original_prompt;
      let queryParams = [];
      let resolvedArtistIds: string[] = [];

      if (intent.original_prompt) {
        const lowered = intent.original_prompt.toLowerCase();
        const promptWords = intent.original_prompt.trim().split(/\s+/);
        if (promptWords.length >= 2 && !(intent.genre && intent.activeFilters?.genre)) {
          isArtistPrompt = true;
        }
      }

      if (isArtistPrompt) {
        const artistWords = intent.original_prompt.trim().split(/\s+/);
        resolvedArtistIds = [];
        for (const name of artistWords) {
          if (name.length < 2) continue;
          const artiResp = await searchArtists([name], token);
          if (artiResp.length > 0) {
            resolvedArtistIds.push(artiResp[0]);
          }
        }
        if (resolvedArtistIds.length > 0) {
          let artistQ = resolvedArtistIds.map((_, idx) => `artist:${artistWords[idx]}`).join(' OR ');
          let yearQ = '';
          if (intent.release_year_range && intent.activeFilters?.releaseYear) {
            yearQ = ` year:${intent.release_year_range.min}-${intent.release_year_range.max}`;
          }
          searchQuery = `${artistQ}${yearQ}`;
          
          const searchResults = await searchTracks(searchQuery, token, 50, 'US');
          if (searchResults.length > 0) {
            allTracks.push(...searchResults);
            seedTracks = getSeedTracks(searchResults, 5);
            seedArtists = resolvedArtistIds.slice(0, 5);
          } else if (resolvedArtistIds.length > 0) {
            try {
              const { getRecommendations } = await import('./spotify-recommendations.ts');
              const recos = await getRecommendations([], resolvedArtistIds, intent, token);
              if (recos && recos.length > 0) {
                allTracks.push(...recos);
              }
            } catch (err) {
              console.error("Spotify recommendations fallback failed", err);
            }
          }
        } else {
          const searchResults = await searchTracks(intent.original_prompt, token, 50, 'US');
          if (searchResults.length > 0) {
            allTracks.push(...searchResults);
            seedTracks = getSeedTracks(searchResults, 5);
          }
        }
      } else {
        if (intent.reference_artists && intent.reference_artists.length > 0 && intent.activeFilters?.references) {
          queryParams.push(`artist:${intent.reference_artists[0]}`);
        }
        if (intent.genre && intent.genre !== "any" && intent.activeFilters?.genre) {
          queryParams.push(`genre:${intent.genre}`);
        }
        if (intent.release_year_range && intent.activeFilters?.releaseYear) {
          queryParams.push(`year:${intent.release_year_range.min}-${intent.release_year_range.max}`);
        }
        if (queryParams.length > 0) {
          searchQuery = `${intent.original_prompt} ${queryParams.join(' ')}`;
        }

        console.log(`Using Spotify search query: ${searchQuery}`);

        const market = intent.locations?.[0] || 'US';
        const searchResults = await searchTracks(searchQuery, token, 50, market);
        if (searchResults.length > 0) {
          allTracks.push(...searchResults);
          seedTracks = getSeedTracks(searchResults, 5);
        } else {
          const broadSearchResults = await searchTracks(intent.original_prompt, token, 50, market);
          if (broadSearchResults.length > 0) {
            allTracks.push(...broadSearchResults);
            seedTracks = getSeedTracks(broadSearchResults, 5);
          }
        }
      }
    }

    if (enabledPlatforms.has('youtube')) {
      console.log("Performing YouTube search...");
      let youtubeQuery = `${intent.original_prompt} audio topic`;

      const regionCode = intent.locations && intent.locations[0] !== 'global' ? intent.locations[0] : undefined;

      try {
        const youtubeResults = await searchYouTubeVideos(youtubeQuery, 50, regionCode);
        if (youtubeResults.length > 0) {
          let tracksToPush = youtubeResults;
          if (intent.release_year_range && intent.activeFilters?.releaseYear) {
            tracksToPush = youtubeResults.filter(track => {
              const publishYear = track.release_year;
              return publishYear ? (
                publishYear >= intent.release_year_range.min && 
                publishYear <= intent.release_year_range.max
              ) : true;
            });
            console.log(`(YOUTUBE) Year filtering: ${tracksToPush.length} / ${youtubeResults.length}`);
          }
          allTracks.push(...tracksToPush);
        } else {
          const fallbackResults = await searchYouTubeVideos(intent.original_prompt + " audio topic", 50, regionCode);
          if (fallbackResults.length > 0) {
            allTracks.push(...fallbackResults);
          }
        }
      } catch (error) {
        console.error("YouTube API error:", error);
        if (enabledPlatforms.size === 1 && allTracks.length === 0) {
          throw new Error(`YouTube search failed: ${error.message}`);
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
