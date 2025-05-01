
import * as React from "react";
import type { Track } from "@/types/table";

/**
 * Hook to process and filter tracks based on search and platform filters
 */
export function useTracks(
  tracks: Track[],
  userLikedTrackIds: string[] = [],
  activePlatform: string,
  searchTerm: string
) {
  // Process tracks to include liked status based on userLikedTrackIds
  const processedTracks = React.useMemo(() => {
    return tracks.map(track => ({
      ...track,
      liked: userLikedTrackIds?.includes(track.id) || track.liked || false
    }));
  }, [tracks, userLikedTrackIds]);

  // Filter tracks by platform and search term
  const filteredTracks = React.useMemo(() => {
    let filtered = processedTracks;
    
    if (activePlatform !== "all") {
      filtered = filtered.filter(track => {
        if (Array.isArray(track.platform)) {
          return track.platform.includes(activePlatform);
        } 
        return track.platform === activePlatform;
      });
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(track => {
        const title = track.title.toLowerCase();
        const artist = Array.isArray(track.artist) 
          ? track.artist.join(' ').toLowerCase() 
          : track.artist.toLowerCase();
        return title.includes(term) || artist.includes(term);
      });
    }
    
    return filtered;
  }, [processedTracks, activePlatform, searchTerm]);

  return { filteredTracks };
}
