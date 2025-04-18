import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ArrowDownUp, ArrowUpDown, ExternalLink, Share2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";

// Musical key mapping (0-11)
const KEY_MAPPING = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];

interface Track {
  title: string;
  artist: string;
  album?: string;
  spotify_id?: string;
  duration?: string;
  match_score?: number;
  audio_features?: {
    bpm?: number;
    key?: number;
    mode?: number;
  };
  platform?: string;
  platform_url?: string;
  cover_url?: string;
}

type SortKey = "number" | "title" | "artist" | "album" | "match" | "bpm" | "key";

interface PlaylistModalProps {
  playlist: {
    id: string;
    name: string;
    prompt: string;
    created_at: string;
    results: Track[];
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export function PlaylistModal({ playlist, isOpen, onClose, onDelete }: PlaylistModalProps) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: "asc" | "desc" }>({
    key: "number",
    direction: "asc",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (playlist && isOpen) {
      // Initialize tracks from playlist results
      const initialTracks = playlist.results.map((track, index) => ({
        ...track,
        number: index + 1,
      }));
      setTracks(initialTracks);
      
      // Get Spotify IDs to fetch audio features
      const spotifyIds = initialTracks
        .filter(track => track.spotify_id)
        .map(track => track.spotify_id as string);
      
      if (spotifyIds.length > 0) {
        fetchAudioFeatures(spotifyIds);
      }
    }
  }, [playlist, isOpen]);

  const fetchAudioFeatures = async (trackIds: string[]) => {
    try {
      setLoading(true);
      
      // Here you would normally call your backend API that interfaces with Spotify
      // For this example, we'll simulate the response
      const mockResponse = await Promise.resolve({
        audio_features: trackIds.map(id => ({
          id,
          tempo: Math.floor(Math.random() * 40) + 100, // Random BPM between 100-140
          key: Math.floor(Math.random() * 12),
          mode: Math.round(Math.random()), // 0 or 1
        })),
      });
      
      // Update tracks with audio features
      setTracks(prevTracks => 
        prevTracks.map(track => {
          if (!track.spotify_id) return track;
          
          const features = mockResponse.audio_features.find(
            item => item.id === track.spotify_id
          );
          
          return features
            ? {
                ...track,
                audio_features: {
                  bpm: Math.round(features.tempo),
                  key: features.key,
                  mode: features.mode,
                }
              }
            : track;
        })
      );
    } catch (error) {
      console.error("Error fetching audio features:", error);
    } finally {
      setLoading(false);
    }
  };

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
      return sortableTracks; // Original order
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
      
      // String comparisons
      const aValue = String(a[sortConfig.key] || "").toLowerCase();
      const bValue = String(b[sortConfig.key] || "").toLowerCase();
      
      if (sortConfig.direction === "asc") {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  };

  if (!playlist) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-[90%] md:max-w-[80%] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold">{playlist.name}</SheetTitle>
          <div className="space-y-1 mb-2">
            <p className="text-sm text-muted-foreground">{playlist.prompt}</p>
            <p className="text-xs text-muted-foreground">
              Created {format(new Date(playlist.created_at), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        </SheetHeader>
        
        <Separator className="my-4" />
        
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
                  <TableCell className="font-medium">
                    {/* Use album art if available */}
                    {track.title}
                  </TableCell>
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
        
        <div className="flex justify-between mt-8">
          <Button variant="outline" size="sm" onClick={() => {}} className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(playlist.id)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
