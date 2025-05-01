
import * as React from "react";
import type { Track } from "./types";
import { useAuth } from "@/context/AuthContext";

export function useTrackProcessor(tracks: Track[], userLikedTrackIds: string[] = []) {
  const { user } = useAuth();
  
  // Enrich tracks with liked status from userLikedTrackIds
  // Only apply liked status for authenticated users
  const tracksWithLikedStatus = React.useMemo(() => {
    return tracks.map(track => ({
      ...track,
      liked: user ? (track.liked || (userLikedTrackIds && userLikedTrackIds.includes(track.id)) || false) : false
    }));
  }, [tracks, userLikedTrackIds, user]);

  return { tracksWithLikedStatus };
}
