
import * as React from "react";
import { Heart } from "lucide-react";
import { useTracks } from "@/context/TracksContext";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

interface TrackLikeButtonProps {
  trackId: string;
  liked: boolean;
  onToggle?: (trackId: string, liked: boolean) => void;
}

export default function TrackLikeButton({ 
  trackId, 
  liked, 
  onToggle
}: TrackLikeButtonProps) {
  const { toggleLike } = useTracks();
  const [isLiked, setIsLiked] = React.useState<boolean>(liked);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  // Update internal state when the liked prop changes
  React.useEffect(() => {
    setIsLiked(liked);
  }, [liked]);

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      // Toggle the local state immediately for a more responsive feel
      const newLikedState = !isLiked;
      setIsLiked(newLikedState);
      
      // Call the toggleLike function from context
      // FIXED: Pass the current track ID and current liked state (not inverted)
      // The toggleLike function in context will handle the inversion
      await toggleLike(trackId, isLiked);
      
      // If onToggle callback exists, call it with the new liked state
      if (onToggle) {
        onToggle(trackId, newLikedState);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert the local state if there was an error
      setIsLiked(isLiked);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleLikeClick}
            disabled={isLoading}
            className={`p-1 rounded-full ${isLiked ? "text-gold" : "text-white/50"} hover:text-gold transition-colors ${isLoading ? 'opacity-50' : ''}`}
            aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart 
              fill={isLiked ? "#DBB13B" : "none"} 
              className={`w-6 h-6 ${isLoading ? 'animate-pulse' : ''}`} 
            />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          {isLiked ? "Remove from favorites" : "Add to favorites"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
