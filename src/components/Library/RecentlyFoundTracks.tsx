
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import TrackLikeButton from "@/components/TrackLikeButton";
import type { Track } from "@/types/table";
import { useEffect } from "react";

interface RecentlyFoundTracksProps {
  tracks: Track[];
  onLikeToggle: (trackId: string, liked: boolean) => void;
}

export function RecentlyFoundTracks({ tracks, onLikeToggle }: RecentlyFoundTracksProps) {
  // Add debug logging
  useEffect(() => {
    if (!tracks || tracks.length === 0) {
      console.info("RecentlyFoundTracks: No tracks available to display");
    } else {
      console.info(`RecentlyFoundTracks: Displaying ${tracks.length} recently found tracks`);
      console.debug("RecentlyFoundTracks first track:", tracks[0]?.title, tracks[0]?.artist);
    }
  }, [tracks]);

  if (!tracks || tracks.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recently Found Tracks</h2>
        <div className="p-4 bg-muted/40 rounded-lg text-center">
          <p className="text-muted-foreground">No recently found tracks yet.</p>
        </div>
      </div>
    );
  }

  const handleTrackLikeToggle = (trackId: string, liked: boolean) => {
    console.log(`RecentlyFoundTracks: Toggling like for track ${trackId}, currently liked: ${liked}`);
    onLikeToggle(trackId, liked);
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
