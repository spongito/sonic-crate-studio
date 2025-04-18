
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { PlaylistTracksTable } from "./PlaylistTracksTable/PlaylistTracksTable";
import { PlaylistActions } from "./PlaylistActions/PlaylistActions";
import { type Playlist } from "./types";

interface PlaylistModalProps {
  playlist: Playlist | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export function PlaylistModal({ playlist, isOpen, onClose, onDelete }: PlaylistModalProps) {
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
        
        <PlaylistTracksTable tracks={playlist.results} />
        
        <PlaylistActions 
          playlistId={playlist.id}
          onShare={() => {}} 
          onDelete={onDelete}
        />
      </SheetContent>
    </Sheet>
  );
}
