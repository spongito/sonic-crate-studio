
import React, { useState, useEffect } from "react";
import { Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlaylistCoverImageProps {
  playlistId: string;
  imageUrl?: string | null;
  name: string;
  onEditClick: () => void;
  className?: string;
}

export function PlaylistCoverImage({ 
  playlistId, 
  imageUrl, 
  name, 
  onEditClick,
  className
}: PlaylistCoverImageProps) {
  const [currentImage, setCurrentImage] = useState<string | null>(imageUrl || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Function to get a fallback image based on playlist ID
  const getFallbackImage = (id: string) => {
    return `https://picsum.photos/seed/${id}/400/400`;
  };

  // Handle image URL changes with smooth transitions
  useEffect(() => {
    if (imageUrl !== currentImage) {
      setIsTransitioning(true);
      
      // After a brief delay to start transition, update the image
      const timer = setTimeout(() => {
        setCurrentImage(imageUrl || null);
        
        // After image is loaded, end transition
        setTimeout(() => {
          setIsTransitioning(false);
        }, 100);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [imageUrl, currentImage]);

  // Handle image load error
  const handleImageError = () => {
    setIsLoading(true);
    const fallbackSrc = getFallbackImage(playlistId);
    setIsTransitioning(true);
    
    // Delay to create smooth transition
    setTimeout(() => {
      setCurrentImage(fallbackSrc);
      setIsTransitioning(false);
      setIsLoading(false);
    }, 300);
  };
  
  return (
    <div className={cn(
      "aspect-square rounded-lg overflow-hidden bg-muted shadow-lg relative group",
      className
    )}>
      <div className={cn(
        "w-full h-full transition-opacity duration-300", 
        isTransitioning ? "opacity-0" : "opacity-100"
      )}>
        {currentImage ? (
          <img 
            src={currentImage}
            alt={name}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-800 to-gray-900">
            <Music className="h-1/3 w-1/3 text-gray-500" />
          </div>
        )}
      </div>
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <div className="animate-pulse text-muted-foreground">
            <Music className="h-1/4 w-1/4" />
          </div>
        </div>
      )}
      
      {/* Centered edit button with fade-in effect */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all duration-300">
        <Button 
          variant="secondary" 
          size="icon"
          className="opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300"
          onClick={onEditClick}
        >
          <Edit className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
