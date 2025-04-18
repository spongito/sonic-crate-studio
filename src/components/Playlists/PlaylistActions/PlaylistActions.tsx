
import { Share2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlaylistActionsProps {
  onShare: () => void;
  onDelete?: (id: string) => void;
  playlistId: string;
}

export function PlaylistActions({ onShare, onDelete, playlistId }: PlaylistActionsProps) {
  return (
    <div className="flex justify-between mt-8">
      <Button variant="outline" size="sm" onClick={onShare} className="gap-2">
        <Share2 className="h-4 w-4" />
        Share
      </Button>
      {onDelete && (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(playlistId)}
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      )}
    </div>
  );
}
