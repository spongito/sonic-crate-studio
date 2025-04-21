
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import TrackLikeButton from "@/components/TrackLikeButton";
import type { Track } from "@/types/table";

interface RecentlyFoundTracksProps {
  tracks: Track[];
  onLikeToggle: (trackId: string, liked: boolean) => void;
}

export function RecentlyFoundTracks({ tracks, onLikeToggle }: RecentlyFoundTracksProps) {
  if (!tracks.length) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Recently Found Tracks</h2>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-4 p-4">
          {tracks.map((track) => (
            <Card key={track.id} className="w-[200px] shrink-0">
              <div className="p-3">
                {track.image_url && (
                  <img
                    src={track.image_url}
                    alt={track.title}
                    className="aspect-square w-full object-cover rounded-md"
                  />
                )}
                <div className="mt-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium truncate">{track.title}</p>
                    <TrackLikeButton
                      trackId={track.id}
                      liked={track.liked}
                      onToggle={() => onLikeToggle(track.id, track.liked)}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {Array.isArray(track.artist) ? track.artist.join(", ") : track.artist}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Found {formatDistanceToNow(new Date(track.created_at), { addSuffix: true })}
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
