
import { useState } from "react";
import { type Track } from "../types";
import { TrackTable } from "@/components/TrackTable";

type SortKey = "number" | "title" | "artist" | "album" | "match" | "bpm" | "key";

interface PlaylistTracksTableProps {
  tracks: Track[];
  loading?: boolean;
}

export function PlaylistTracksTable({ tracks, loading }: PlaylistTracksTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: "asc" | "desc" }>({
    key: "number",
    direction: "asc",
  });

  const handleSort = (column: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === column && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key: column as SortKey, direction });
  };

  const getSortedTracks = () => {
    if (sortConfig.key === "number") {
      return tracks;
    }
    
    return [...tracks].sort((a, b) => {
      const multiplier = sortConfig.direction === "asc" ? 1 : -1;
      
      switch (sortConfig.key) {
        case "match":
          return multiplier * ((a.match_score || 0) - (b.match_score || 0));
        case "bpm":
          return multiplier * ((a.audio_features?.bpm || 0) - (b.audio_features?.bpm || 0));
        default:
          const aValue = String(a[sortConfig.key] || "").toLowerCase();
          const bValue = String(b[sortConfig.key] || "").toLowerCase();
          return multiplier * aValue.localeCompare(bValue);
      }
    });
  };

  return (
    <TrackTable 
      tracks={getSortedTracks()}
      onSortColumn={handleSort}
      sortConfig={sortConfig}
    />
  );
}
