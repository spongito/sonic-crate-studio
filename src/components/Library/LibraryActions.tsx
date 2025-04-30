
import { Button } from "@/components/ui/button";
import { RefreshCw, LibraryBig } from "lucide-react";

interface LibraryActionsProps {
  onRefresh: () => void;
  onSync: () => void;
}

export function LibraryActions({ onRefresh, onSync }: LibraryActionsProps) {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-semibold">Your Music Library</h1>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
        <Button variant="outline" size="sm" onClick={onSync}>
          <LibraryBig className="mr-2 h-4 w-4" />
          Sync Playlists
        </Button>
      </div>
    </div>
  );
}
