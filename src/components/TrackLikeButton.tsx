
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Heart, Plus } from "lucide-react";
import { useTracks } from "@/context/TracksContext";
import { toast } from "@/components/ui/use-toast";
import { useLogger } from "@/hooks/useLogger";

interface TrackLikeButtonProps {
  trackId: string;
  liked: boolean;
  onToggle?: (trackId: string, liked: boolean) => void;
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
  const { toggleLike } = useTracks();
  const [isLiked, setIsLiked] = React.useState<boolean>(liked);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const logger = useLogger('TrackLikeButton');

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
      
      logger.debug(`Toggling like for track ${trackId}, new state: ${newLikedState}`);
      
      // Call the toggleLike function from context
      await toggleLike(trackId, isLiked);
      
      // If onToggle callback exists, call it
      if (onToggle) {
        onToggle(trackId, newLikedState);
      }
      
      toast({
        description: newLikedState ? "Added to liked tracks" : "Removed from liked tracks",
        duration: 2000,
      });
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert the local state if there was an error
      setIsLiked(isLiked);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update liked status",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleLikeClick}
        disabled={isLoading}
        className={`ml-3 p-1 rounded-full ${isLiked ? "text-gold" : "text-white/50"} hover:text-gold transition-colors ${isLoading ? 'opacity-50' : ''}`}
        title={isLiked ? "Unlike" : "Like"}
      >
        <Heart 
          fill={isLiked ? "#DBB13B" : "none"} 
          className={`w-6 h-6 ${isLoading ? 'animate-pulse' : ''}`} 
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
