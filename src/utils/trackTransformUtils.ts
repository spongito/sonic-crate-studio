import { Track } from '@/types/table';
import { formatDuration } from './durationUtils';

export const transformHistoryTrack = (historyTrack: any, likedTrackIdSet: Set<string>): Track => {
  const formattedDuration = historyTrack.duration_seconds 
    ? formatDuration({ duration_seconds: typeof historyTrack.duration_seconds === 'string' 
        ? parseFloat(historyTrack.duration_seconds) 
        : historyTrack.duration_seconds 
    })
    : "0:00";
  
  return {
    id: historyTrack.track_id || historyTrack.id,
    title: historyTrack.title || '',
    artist: Array.isArray(historyTrack.artist) ? historyTrack.artist : [historyTrack.artist || ''],
    album: historyTrack.album || '',
    platform: historyTrack.platform || '',
    bpm: historyTrack.bpm || null,
    key_signature: historyTrack.key_signature || undefined,
    image_url: historyTrack.image_url || undefined,
    genre: historyTrack.genre ? (Array.isArray(historyTrack.genre) ? historyTrack.genre : [historyTrack.genre]) : [],
    liked: likedTrackIdSet.has(historyTrack.track_id || historyTrack.id),
    duration: formattedDuration,
    duration_seconds: historyTrack.duration_seconds,
    created_at: historyTrack.created_at
  };
};

export const transformMasterTrack = (masterTrack: any): Track => {
  const formattedDuration = masterTrack.duration_seconds 
    ? formatDuration({ duration_seconds: typeof masterTrack.duration_seconds === 'string' 
        ? parseFloat(masterTrack.duration_seconds) 
        : masterTrack.duration_seconds 
    })
    : masterTrack.duration || "0:00";
    
  return {
    id: masterTrack.id,
    title: masterTrack.title || '',
    artist: Array.isArray(masterTrack.artist) ? masterTrack.artist : [masterTrack.artist || ''],
    album: masterTrack.album || '',
    platform: masterTrack.platform || '',
    duration: formattedDuration,
    duration_seconds: masterTrack.duration_seconds,
    bpm: masterTrack.bpm || null,
    genre: masterTrack.genre || [],
    key_signature: masterTrack.key_signature,
    release_year: masterTrack.release_year,
    image_url: masterTrack.image_url,
    liked: true, // These are from liked_tracks so they're definitely liked
    mood: masterTrack.mood,
    language: masterTrack.language,
    label: masterTrack.label,
    is_explicit: masterTrack.is_explicit,
    play_count: masterTrack.play_count
  };
};
