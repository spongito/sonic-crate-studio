
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Heart, HeartOff } from "lucide-react";

interface TrackLikeButtonProps {
  trackId: string;
  liked: boolean;
  onToggle: (trackId: string) => void;
}

export default function TrackLikeButton({ trackId, liked, onToggle }: TrackLikeButtonProps) {
  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={() => onToggle(trackId)}
      className="h-8 w-8 rounded-full hover:bg-muted/80"
    >
      {liked ? (
        <Heart className="h-4 w-4 text-primary" fill="currentColor" />
      ) : (
        <HeartOff className="h-4 w-4 text-muted-foreground" />
      )}
    </Button>
  );
}
