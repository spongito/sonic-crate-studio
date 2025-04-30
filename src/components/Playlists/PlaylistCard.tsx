
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Music } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlaylistCardProps {
  id: string;
  title: string;
  coverUrl?: string | null;
  trackCount: number;
  createdAt: string;
  className?: string;
}

export function PlaylistCard({ 
  id, 
  title, 
  coverUrl, 
  trackCount, 
  createdAt,
  className
}: PlaylistCardProps) {
  const [currentImage, setCurrentImage] = useState<string | null>(coverUrl || null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Function to get a consistent fallback image based on playlist ID
  const getFallbackImage = (playlistId: string) => {
    return `https://picsum.photos/seed/${playlistId}/400/400`;
  };

  // Handle image URL changes with smooth transitions
  useEffect(() => {
    if (coverUrl !== currentImage) {
      setIsTransitioning(true);
      
      // After a brief delay to start transition, update the image
      const timer = setTimeout(() => {
        setCurrentImage(coverUrl || null);
        
        // After image is loaded, end transition
        setTimeout(() => {
          setIsTransitioning(false);
        }, 100);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [coverUrl, currentImage]);

  const handleImageError = () => {
    setIsLoading(true);
    const fallbackSrc = getFallbackImage(id);
    setIsTransitioning(true);
    
    // Delay to create smooth transition
    setTimeout(() => {
      setCurrentImage(fallbackSrc);
      setIsTransitioning(false);
      setIsLoading(false);
    }, 300);
  };
  
  return (
    <Link to={`/playlists/${id}`}>
      <Card className={cn(
        "neo-card overflow-hidden group transition-all duration-300 hover:scale-[1.02]",
        className
      )}>
        <AspectRatio ratio={1} className="bg-muted relative">
          <div className={cn(
            "w-full h-full transition-opacity duration-300", 
            isTransitioning ? "opacity-0" : "opacity-100"
          )}>
            {currentImage ? (
              <img 
                src={currentImage} 
                alt={title}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
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
        </AspectRatio>
        <CardHeader className="p-4">
          <CardTitle className="text-lg font-semibold tracking-tight group-hover:text-gold transition-colors">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{trackCount} tracks</span>
            <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
