
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Heart, Plus } from "lucide-react";
import { useTracks } from "@/context/TracksContext";
import { toast } from "sonner";

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
      
      // Call the toggleLike function from context with both required arguments
      await toggleLike(trackId, newLikedState);
      
      // If onToggle callback exists, call it
      if (onToggle) {
        onToggle(trackId, newLikedState);
      }
      
      toast(newLikedState ? "Added to liked tracks" : "Removed from liked tracks");
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert the local state if there was an error
      setIsLiked(isLiked);
      toast.error("Failed to update liked status");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddToLibraryClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onAddToLibrary) {
      onAddToLibrary(trackId);
      toast("Added to your library");
    }
  };
  
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleLikeClick}
        disabled={isLoading}
        className={`ml-3 p-1 rounded-full ${isLiked ? "text-gold" : "text-white/50"} hover:text-gold transition-colors ${isLoading ? 'opacity-50' : ''}`}
        title={isLiked ? "Unlike" : "Like"}
        aria-label={isLiked ? "Unlike this track" : "Like this track"}
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
          onClick={handleAddToLibraryClick}
          className="h-8 w-8 rounded-full hover:bg-muted/80 transition-colors"
          title="Add to Library"
          aria-label="Add to library"
        >
          <Plus className="h-4 w-4 text-muted-foreground" />
        </Button>
      )}
    </div>
  );
}
