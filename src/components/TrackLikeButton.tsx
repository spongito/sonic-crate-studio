
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Heart, Plus } from "lucide-react";

interface TrackLikeButtonProps {
  trackId: string;
  liked: boolean;
  onToggle: (trackId: string) => void;
  onAddToLibrary?: (trackId: string) => void;
  showAddToLibrary?: boolean;
}

export default function TrackLikeButton({ 
  trackId, 
  liked, 
  onToggle,
  onAddToLibrary,
  showAddToLibrary = false
}: TrackLikeButtonProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onToggle(trackId)}
        className={`ml-3 p-1 rounded-full ${liked ? "text-gold" : "text-white/50"} hover:text-gold transition-colors`}
        title={liked ? "Unlike" : "Like"}
      >
        <Heart 
          fill={liked ? "#DBB13B" : "none"} 
          className="w-6 h-6" 
        />
      </button>
      
      {showAddToLibrary && onAddToLibrary && (
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onAddToLibrary(trackId)}
          className="h-8 w-8 rounded-full hover:bg-muted/80 transition-colors"
          title="Add to Library"
        >
          <Plus className="h-4 w-4 text-muted-foreground" />
        </Button>
      )}
    </div>
  );
}
