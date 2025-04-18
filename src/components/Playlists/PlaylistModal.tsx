
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Share2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface PlaylistModalProps {
  playlist: {
    id: string;
    name: string;
    prompt: string;
    created_at: string;
    results: Array<{ title: string; artist: string; duration?: string }>;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export function PlaylistModal({ playlist, isOpen, onClose, onDelete }: PlaylistModalProps) {
  if (!playlist) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{playlist.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{playlist.prompt}</p>
          <p className="text-xs text-muted-foreground">
            Created {format(new Date(playlist.created_at), "MMM d, yyyy 'at' h:mm a")}
          </p>
          <Separator />
          <ScrollArea className="h-[300px] rounded-md border p-4">
            <div className="space-y-2">
              {playlist.results.map((track, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{track.title} - {track.artist}</span>
                  {track.duration && <span className="text-muted-foreground">{track.duration}</span>}
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex justify-between">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
