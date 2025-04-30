
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Music, Search, RefreshCw } from "lucide-react";

interface EmptyLibraryStateProps {
  onSyncClick: () => void;
}

export function EmptyLibraryState({ onSyncClick }: EmptyLibraryStateProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-card border rounded-lg p-8 text-center max-w-2xl mx-auto shadow-sm">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Music className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-semibold mb-2">Your Library is Empty</h2>
        <p className="text-muted-foreground mb-6">
          Start by discovering new tracks using the Music Finder to build your personal library. 
          Any tracks you find will appear here.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link to="/music-finder">
              <Search className="mr-2 h-4 w-4" />
              Find Music
            </Link>
          </Button>
          <Button variant="outline" onClick={onSyncClick}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync Existing Playlists
          </Button>
        </div>
      </div>
    </div>
  );
}
