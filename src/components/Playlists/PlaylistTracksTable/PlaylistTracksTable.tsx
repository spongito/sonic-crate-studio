import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { type Track } from "../types";
import { ArrowDownUp, ArrowUpDown } from "lucide-react";

// Musical key mapping (0-11)
const KEY_MAPPING = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];

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

  const formatKey = (key?: number, mode?: number): string => {
    if (key === undefined || mode === undefined) return "—";
    return `${KEY_MAPPING[key]} ${mode === 1 ? "Major" : "Minor"}`;
  };

  const requestSort = (key: SortKey) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortedTracks = () => {
    const sortableTracks = [...tracks];
    if (sortConfig.key === "number") {
      return sortableTracks;
    }
    
    return sortableTracks.sort((a, b) => {
      if (sortConfig.key === "match") {
        const aValue = a.match_score ?? 0;
        const bValue = b.match_score ?? 0;
        return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
      }
      
      if (sortConfig.key === "bpm") {
        const aValue = a.audio_features?.bpm ?? 0;
        const bValue = b.audio_features?.bpm ?? 0;
        return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
      }
      
      if (sortConfig.key === "key") {
        const aValue = a.audio_features?.key ?? -1;
        const bValue = b.audio_features?.key ?? -1;
        if (aValue === bValue) {
          const aMode = a.audio_features?.mode ?? 0;
          const bMode = b.audio_features?.mode ?? 0;
          return sortConfig.direction === "asc" ? aMode - bMode : bMode - aMode;
        }
        return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
      }
      
      const aValue = String(a[sortConfig.key] || "").toLowerCase();
      const bValue = String(b[sortConfig.key] || "").toLowerCase();
      
      return sortConfig.direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12" onClick={() => requestSort("number")}>
              <div className="flex items-center cursor-pointer">#
                {sortConfig.key === "number" && (
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                )}
              </div>
            </TableHead>
            <TableHead onClick={() => requestSort("title")}>
              <div className="flex items-center cursor-pointer">Track
                {sortConfig.key === "title" && (
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                )}
              </div>
            </TableHead>
            <TableHead onClick={() => requestSort("artist")}>
              <div className="flex items-center cursor-pointer">Artist
                {sortConfig.key === "artist" && (
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                )}
              </div>
            </TableHead>
            <TableHead className="hidden md:table-cell" onClick={() => requestSort("album")}>
              <div className="flex items-center cursor-pointer">Album
                {sortConfig.key === "album" && (
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                )}
              </div>
            </TableHead>
            <TableHead className="w-14 text-center">Platform</TableHead>
            <TableHead className="w-20" onClick={() => requestSort("match")}>
              <div className="flex items-center cursor-pointer">Match
                {sortConfig.key === "match" && (
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                )}
              </div>
            </TableHead>
            <TableHead className="w-20" onClick={() => requestSort("bpm")}>
              <div className="flex items-center cursor-pointer">BPM
                {sortConfig.key === "bpm" && (
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                )}
              </div>
            </TableHead>
            <TableHead className="w-24" onClick={() => requestSort("key")}>
              <div className="flex items-center cursor-pointer">Key
                {sortConfig.key === "key" && (
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                )}
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {getSortedTracks().map((track, idx) => (
            <TableRow key={idx} className="group">
              <TableCell className="font-medium">{idx + 1}</TableCell>
              <TableCell className="font-medium">{track.title}</TableCell>
              <TableCell>{track.artist}</TableCell>
              <TableCell className="hidden md:table-cell">{track.album || "—"}</TableCell>
              <TableCell className="text-center">
                {track.spotify_id && (
                  <a 
                    href={`https://open.spotify.com/track/${track.spotify_id.split(':').pop()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open in Spotify"
                  >
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 opacity-70 group-hover:opacity-100"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </a>
                )}
              </TableCell>
              <TableCell>
                {track.match_score ? (
                  <Badge variant={track.match_score > 80 ? "default" : "secondary"} className="ml-2">
                    {track.match_score}%
                  </Badge>
                ) : "—"}
              </TableCell>
              <TableCell>
                {loading ? (
                  <span className="text-xs text-muted-foreground">Loading...</span>
                ) : (
                  track.audio_features?.bpm || "—"
                )}
              </TableCell>
              <TableCell>
                {loading ? (
                  <span className="text-xs text-muted-foreground">Loading...</span>
                ) : (
                  formatKey(track.audio_features?.key, track.audio_features?.mode)
                )}
              </TableCell>
            </TableRow>
          ))}
          {tracks.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                No tracks found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
