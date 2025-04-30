
import { Button } from "@/components/ui/button";
import { Edit, Music } from "lucide-react";

interface PlaylistHeaderProps {
  playlist: {
    id: string;
    name: string;
    description?: string | null;
    prompt?: string;
    created_at: string;
    genres?: string[];
  };
  tracks: any[];
  onEditClick: () => void;
  coverImageUrl?: string | null;
}

export function PlaylistHeader({ playlist, tracks, onEditClick, coverImageUrl }: PlaylistHeaderProps) {
  // Function to get a fallback image based on playlist ID
  const getFallbackImage = (playlistId: string) => {
    return `https://picsum.photos/seed/${playlistId}/400/400`;
  };

  const firstTrackImage = tracks?.[0]?.image_url;
  const displayImage = coverImageUrl || firstTrackImage || getFallbackImage(playlist.id);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
      {/* Cover Image */}
      <div className="aspect-square rounded-lg overflow-hidden bg-muted shadow-lg relative group">
        {displayImage ? (
          <img 
            src={displayImage}
            alt={playlist.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // If image fails to load, use fallback
              const target = e.target as HTMLImageElement;
              target.src = getFallbackImage(playlist.id);
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

      {/* Playlist Info */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-white">{playlist.name}</h1>
          </div>
          <p className="text-muted-foreground">
            {playlist.description || playlist.prompt}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <span>Created {new Date(playlist.created_at).toLocaleDateString()}</span>
          <span>•</span>
          <span>{tracks.length || 0} tracks</span>
          {playlist.genres && playlist.genres.length > 0 && (
            <>
              <span>•</span>
              <span>{playlist.genres.join(", ")}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
