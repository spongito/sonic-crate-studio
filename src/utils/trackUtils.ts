
/**
 * Format track duration based on available data
 */
export const formatDuration = (track: any): string => {
  // If track already has a formatted duration string, use it
  if (typeof track.duration === 'string' && track.duration) {
    return track.duration;
  }
  
  // If we have duration in seconds, format it
  if (typeof track.duration_seconds === 'number') {
    const minutes = Math.floor(track.duration_seconds / 60);
    const seconds = Math.floor(track.duration_seconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  
  // Default duration if nothing is available
  return "0:00";
};

/**
 * Convert milliseconds to seconds
 */
export const msToSeconds = (ms: number): number => {
  return Math.floor(ms / 1000);
};
