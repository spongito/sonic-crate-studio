
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import type { Playlist } from "./types";

interface ListViewProps {
  playlists: Playlist[];
  onPlaylistClick: (playlist: Playlist) => void;
}

export function ListView({ playlists, onPlaylistClick }: ListViewProps) {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">Description</TableHead>
            <TableHead>Tracks</TableHead>
            <TableHead className="hidden sm:table-cell">Created</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {playlists.map((playlist) => (
            <TableRow key={playlist.id}>
              <TableCell className="font-medium">{playlist.name}</TableCell>
              <TableCell className="hidden md:table-cell max-w-[300px] truncate">{playlist.prompt}</TableCell>
              <TableCell>{Array.isArray(playlist.results) ? playlist.results.length : 0}</TableCell>
              <TableCell className="hidden sm:table-cell">
                {format(new Date(playlist.created_at), "MMM d, yyyy")}
              </TableCell>
              <TableCell>
                <Link to={`/playlists/${playlist.id}`}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault();
                      onPlaylistClick(playlist);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
