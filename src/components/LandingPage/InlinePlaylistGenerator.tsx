
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Folder } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePlaylistOperations } from "@/hooks/use-playlist-operations";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface InlinePlaylistGeneratorProps {
  playlistData: any;
  className?: string;
}

export default function InlinePlaylistGenerator({ playlistData, className }: InlinePlaylistGeneratorProps) {
  const navigate = useNavigate();
  const { savePlaylist, isSaving } = usePlaylistOperations();
  const [saved, setSaved] = useState(false);
  
  const handleSavePlaylist = async () => {
    await savePlaylist(playlistData);
    setSaved(true);
    toast.success("Playlist saved successfully!");
  };
  
  const handleGoToPlaylists = () => {
    navigate("/playlists");
  };

  return (
    <div className={`space-y-6 glass-morphism p-6 rounded-xl ${className}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gradient">
          {playlistData.name || "Generated Playlist"}
        </h2>
        
        <div className="flex gap-3">
          <Button 
            onClick={handleSavePlaylist} 
            disabled={isSaving || saved}
            className="neo-gold-button"
          >
            {isSaving ? "Saving..." : saved ? "Saved" : "Save Playlist"}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleGoToPlaylists}
            className="border-white/10"
          >
            <Folder className="mr-2 h-4 w-4" />
            My Playlists
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">#</TableHead>
              <TableHead>Track</TableHead>
              <TableHead>Artist</TableHead>
              <TableHead className="hidden md:table-cell">Album</TableHead>
              <TableHead className="hidden md:table-cell">Platform</TableHead>
              <TableHead className="hidden md:table-cell">Match</TableHead>
              <TableHead className="hidden md:table-cell">BPM</TableHead>
              <TableHead className="hidden md:table-cell">Key</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {playlistData?.tracks?.map((track: any, index: number) => (
              <TableRow key={`${track.id}-${index}`}>
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
                    <span className="line-clamp-1">{track.title || track.name}</span>
                  </div>
                </TableCell>
                <TableCell className="line-clamp-1">{track.artist}</TableCell>
                <TableCell className="hidden md:table-cell line-clamp-1">{track.album}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="outline" className="bg-white/5">
                    {track.platform || "spotify"}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="outline" className={`${getMatchScoreColor(track.match_score || 0)}`}>
                    {track.match_score || "—"}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="outline" className="bg-white/5">
                    {(track.audio_features?.bpm ?? "—")}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="outline" className="bg-white/5">
                    {formatKeySignature(track)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function formatKeySignature(track: any): string {
  if (track.audio_features?.key_signature) {
    return track.audio_features.key_signature;
  }
  
  // If we have key and mode, but not key_signature
  if (track.audio_features?.key !== undefined && track.audio_features?.mode !== undefined) {
    const keys = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
    const modes = ["Minor", "Major"];
    const key = keys[track.audio_features.key];
    const mode = modes[track.audio_features.mode];
    return `${key} ${mode}`;
  }
  
  return "—";
}

function getMatchScoreColor(score: number): string {
  if (score >= 90) return "bg-green-500/20 text-green-300";
  if (score >= 75) return "bg-gold/20 text-gold";
  return "bg-white/10";
}
