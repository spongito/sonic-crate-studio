
import React from "react";
import { Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

interface PlaylistCoverImageProps {
  playlistId: string;
  imageUrl?: string | null;
  name: string;
  onEditClick: () => void;
}

export function PlaylistCoverImage({ 
  playlistId, 
  imageUrl, 
  name, 
  onEditClick 
}: PlaylistCoverImageProps) {
  // Function to get a fallback image based on playlist ID
  const getFallbackImage = (id: string) => {
    return `https://picsum.photos/seed/${id}/400/400`;
  };
  
  return (
    <div className="aspect-square rounded-lg overflow-hidden bg-muted shadow-lg relative group">
      {imageUrl ? (
        <img 
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // If image fails to load, use fallback
            const target = e.target as HTMLImageElement;
            target.src = getFallbackImage(playlistId);
          }}
        />
      ) : (
        <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-800 to-gray-900">
          <Music className="h-1/3 w-1/3 text-gray-500" />
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
