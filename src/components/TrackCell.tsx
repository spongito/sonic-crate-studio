
import * as React from "react";
import type { Track } from "./GeneratedPlaylistTable";

interface TrackCellProps {
  track: Track;
}

/** Handles title, artist (with array support), album art (with fallback). */
export default function TrackCell({ track }: TrackCellProps) {
  const artistDisplay = Array.isArray(track.artist)
    ? track.artist.join(", ")
    : track.artist;
  const imageUrl = track.albumArt || track.image_url;
  return (
    <div className="flex items-center gap-3 py-1">
      <img
        src={imageUrl}
        alt={`${track.title} cover`}
        className="w-10 h-10 rounded-md shadow-sm object-cover"
        onError={(e) => {
          e.currentTarget.src = "/album-placeholder.svg";
        }}
      />
      <div className="flex flex-col">
        <div className="font-medium text-sm">{track.title}</div>
        <div className="text-xs text-muted-foreground">{artistDisplay}</div>
      </div>
    </div>
  );
}
