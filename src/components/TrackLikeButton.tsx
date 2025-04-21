
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Heart, HeartOff, Plus, Loader2 } from "lucide-react";

interface TrackLikeButtonProps {
  trackId: string;
  liked: boolean;
  onToggle: (trackId: string) => void;
  onAddToLibrary?: (trackId: string) => void;
  showAddToLibrary?: boolean;
  isLoading?: boolean;
}

export default function TrackLikeButton({ 
  trackId, 
  liked, 
  onToggle,
  onAddToLibrary,
  showAddToLibrary = false,
  isLoading = false
}: TrackLikeButtonProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        size="icon"
        variant="ghost"
        onClick={() => onToggle(trackId)}
        className="h-8 w-8 rounded-full hover:bg-muted/80 transition-colors"
        title={liked ? "Unlike" : "Like"}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : liked ? (
          <Heart className="h-4 w-4 text-primary" fill="currentColor" />
        ) : (
          <HeartOff className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>
      
      {showAddToLibrary && onAddToLibrary && (
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onAddToLibrary(trackId)}
          className="h-8 w-8 rounded-full hover:bg-muted/80 transition-colors"
          title="Add to Library"
          disabled={isLoading}
        >
          <Plus className="h-4 w-4 text-muted-foreground" />
        </Button>
      )}
    </div>
  );
}
