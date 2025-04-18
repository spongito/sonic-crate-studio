
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ListViewProps {
  playlists: any[];
  onPlaylistClick: (playlist: any) => void;
}

export function ListView({ playlists, onPlaylistClick }: ListViewProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {playlists.map((playlist) => (
            <TableRow key={playlist.id}>
              <TableCell className="font-medium">{playlist.name}</TableCell>
              <TableCell className="max-w-[300px] truncate">{playlist.prompt}</TableCell>
              <TableCell>
                {format(new Date(playlist.created_at), "MMM d, yyyy")}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onPlaylistClick(playlist)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
