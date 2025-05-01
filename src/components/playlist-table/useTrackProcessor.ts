
import * as React from "react";
import type { Track } from "./types";

export function useTrackProcessor(tracks: Track[], userLikedTrackIds: string[] = []) {
  // Enrich tracks with liked status from userLikedTrackIds
  const tracksWithLikedStatus = React.useMemo(() => {
    return tracks.map(track => ({
      ...track,
      liked: track.liked || (userLikedTrackIds && userLikedTrackIds.includes(track.id)) || false
    }));
  }, [tracks, userLikedTrackIds]);

  return { tracksWithLikedStatus };
}
