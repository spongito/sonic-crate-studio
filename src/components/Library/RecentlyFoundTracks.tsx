
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import TrackLikeButton from "@/components/TrackLikeButton";
import type { Track } from "@/types/table";
import { useLogger } from "@/hooks/useLogger";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Music, Search } from "lucide-react";
import { toast } from "sonner";

interface RecentlyFoundTracksProps {
  tracks: Track[];
  onLikeToggle: (trackId: string, liked: boolean) => void;
}

export function RecentlyFoundTracks({ tracks, onLikeToggle }: RecentlyFoundTracksProps) {
  const logger = useLogger("RecentlyFoundTracks");
  
  useEffect(() => {
    if (!tracks || tracks.length === 0) {
      logger.info("No tracks available to display");
    } else {
      logger.info(`Displaying ${tracks.length} recently found tracks`);
      logger.debug("First track:", { title: tracks[0]?.title, artist: tracks[0]?.artist });
    }
  }, [tracks, logger]);

  if (!tracks || tracks.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recently Found Tracks</h2>
        <Card className="p-6">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Music className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">Start discovering new music to see your recent finds here.</p>
            <Button asChild size="sm" variant="secondary">
              <Link to="/music-finder">
                <Search className="mr-2 h-4 w-4" />
                Find Music
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const handleTrackLikeToggle = async (trackId: string, liked: boolean) => {
    logger.debug(`Toggling like for track ${trackId}, currently liked: ${liked}`);
    try {
      await onLikeToggle(trackId, liked);
      // Toast notifications are handled by the parent component (LibraryMain)
    } catch (error) {
      logger.error("Error toggling track like:", error);
      toast.error("Failed to update liked status");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Recently Found Tracks</h2>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-4 p-4">
          {tracks.map((track) => (
            <Card key={track.id} className="w-[200px] shrink-0">
              <div className="p-3">
                {track.image_url ? (
                  <img
                    src={track.image_url}
                    alt={track.title}
                    className="aspect-square w-full object-cover rounded-md"
                    loading="lazy"
                  />
                ) : (
                  <div className="aspect-square w-full bg-muted rounded-md flex items-center justify-center">
                    <span className="text-muted-foreground">No image</span>
                  </div>
                )}
                <div className="mt-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium truncate">{track.title}</p>
                    <TrackLikeButton
                      trackId={track.id}
                      liked={track.liked || false}
                      onToggle={() => handleTrackLikeToggle(track.id, track.liked || false)}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {Array.isArray(track.artist) ? track.artist.join(", ") : track.artist}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {track.created_at ? 
                      `Found ${formatDistanceToNow(new Date(track.created_at), { addSuffix: true })}` : 
                      'Recently found'}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
