
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Music, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Track } from "@/components/Playlists/types";

interface TrackTableProps {
  tracks: Track[];
  onSortColumn?: (column: string) => void;
  sortConfig?: {
    key: string;
    direction: 'asc' | 'desc';
  };
}

export function TrackTable({ tracks, onSortColumn, sortConfig }: TrackTableProps) {
  const isSortable = !!onSortColumn;
  
  const getPlatformIcon = (platform?: string) => {
    switch (platform?.toLowerCase()) {
      case 'spotify':
        return <Music className="h-4 w-4 text-green-400" />;
      case 'youtube':
        return <Youtube className="h-4 w-4 text-red-400" />;
      default:
        return <Music className="h-4 w-4" />;
    }
  };
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[60px]">#</TableHead>
          <TableHead>Track</TableHead>
          <TableHead>Artist</TableHead>
          <TableHead className="hidden md:table-cell">Album</TableHead>
          <TableHead className="hidden md:table-cell">Platform</TableHead>
          <TableHead 
            className="hidden md:table-cell cursor-pointer"
            onClick={() => isSortable && onSortColumn('match_score')}
          >
            Match
          </TableHead>
          <TableHead 
            className="hidden md:table-cell cursor-pointer"
            onClick={() => isSortable && onSortColumn('bpm')}
          >
            BPM
          </TableHead>
          <TableHead className="hidden md:table-cell">
            Key
          </TableHead>
          <TableHead 
            className="hidden md:table-cell cursor-pointer"
            onClick={() => isSortable && onSortColumn('genre')}
          >
            Genre
          </TableHead>
          <TableHead 
            className="hidden md:table-cell cursor-pointer"
            onClick={() => isSortable && onSortColumn('release_year')}
          >
            Year
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tracks.map((track, index) => (
          <TableRow key={`${track.spotify_id || track.youtube_id || index}-${index}`}>
            <TableCell>{index + 1}</TableCell>
            <TableCell className="font-medium">
              <div className="flex items-center gap-3">
                {track.cover_url && (
                  <img 
                    src={track.cover_url} 
                    alt={track.title}
                    className="w-10 h-10 rounded object-cover"
                  />
                )}
                <span className="line-clamp-1">{track.title}</span>
              </div>
            </TableCell>
            <TableCell className="line-clamp-1">{track.artist}</TableCell>
            <TableCell className="hidden md:table-cell line-clamp-1">{track.album}</TableCell>
            <TableCell className="hidden md:table-cell">
              <div className="flex items-center gap-2">
                {getPlatformIcon(track.platform)}
                {track.platform_url && (
                  <a 
                    href={track.platform_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                )}
              </div>
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {track.match_score && (
                <Badge variant="outline" className={getMatchScoreColor(track.match_score)}>
                  {track.match_score}
                </Badge>
              )}
            </TableCell>
            <TableCell className="hidden md:table-cell">
              <Badge variant="outline" className="bg-white/5">
                {track.audio_features?.bpm ?? "—"}
              </Badge>
            </TableCell>
            <TableCell className="hidden md:table-cell">
              <Badge variant="outline" className="bg-white/5">
                {formatKeySignature(track.audio_features?.key, track.audio_features?.mode) ?? "—"}
              </Badge>
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {track.genre && track.genre.length > 0 ? (
                <Badge variant="outline" className="bg-gold/10 text-gold">
                  {track.genre[0]}
                </Badge>
              ) : "—"}
            </TableCell>
            <TableCell className="hidden md:table-cell text-muted-foreground">
              {track.release_year || "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function getMatchScoreColor(score: number): string {
  if (score >= 90) return "bg-green-500/20 text-green-300";
  if (score >= 75) return "bg-gold/20 text-gold";
  return "bg-white/10";
}

function formatKeySignature(key?: number, mode?: number): string {
  if (key === undefined || mode === undefined || key < 0 || key > 11) {
    return "—";
  }
  
  const keys = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
  const modes = ["Minor", "Major"];
  
  return `${keys[key]} ${modes[mode]}`;
}
