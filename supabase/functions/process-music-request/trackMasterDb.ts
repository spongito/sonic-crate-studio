
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

export async function saveMasterTrack(track: any, audioFeatures: any) {
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
    } else if (track.audio_features) {
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
      acousticness = track.acousticness;
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

export function formatKey(key: number, mode: number) {
  const notes = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
  if (key === undefined || mode === undefined || key < 0 || key >= notes.length) {
    return "Unknown";
  }
  return `${notes[key]} ${mode === 1 ? "Major" : "Minor"}`;
}

