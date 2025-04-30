
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Music } from "lucide-react";

interface PlaylistCardProps {
  id: string;
  title: string;
  coverUrl?: string | null;
  trackCount: number;
  createdAt: string;
}

export function PlaylistCard({ id, title, coverUrl, trackCount, createdAt }: PlaylistCardProps) {
  // Function to get a consistent fallback image based on playlist ID
  const getFallbackImage = (playlistId: string) => {
    return `https://picsum.photos/seed/${playlistId}/400/400`;
  };
  
  return (
    <Link to={`/playlists/${id}`}>
      <Card className="neo-card overflow-hidden group transition-all duration-300 hover:scale-[1.02]">
        <AspectRatio ratio={1} className="bg-muted">
          {coverUrl ? (
            <img 
              src={coverUrl} 
              alt={title}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                // If image fails to load, use fallback
                const target = e.target as HTMLImageElement;
                target.src = getFallbackImage(id);
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-800 to-gray-900">
              <Music className="h-1/3 w-1/3 text-gray-500" />
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
