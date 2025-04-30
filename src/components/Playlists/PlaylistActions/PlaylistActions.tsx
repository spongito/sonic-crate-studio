
import { Edit, Share2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PlaylistActionsProps {
  onShare: () => void;
  onDelete?: (id: string) => void;
  onEdit?: () => void;
  playlistId: string;
}

export function PlaylistActions({ onShare, onDelete, onEdit, playlistId }: PlaylistActionsProps) {
  return (
    <div className="flex gap-2 mt-8">
      {onEdit && (
        <Button variant="outline" size="icon" onClick={onEdit} className="gap-2">
          <Edit className="h-4 w-4" />
        </Button>
      )}
      
      {onDelete && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="icon" className="gap-2">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your playlist.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex justify-end gap-2">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(playlistId)}>
                Delete
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}
      
      <Button variant="outline" size="sm" onClick={onShare} className="gap-2">
        <Share2 className="h-4 w-4" />
        Share
      </Button>
    </div>
  );
}
