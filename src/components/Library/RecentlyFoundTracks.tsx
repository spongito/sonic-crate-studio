
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useTrackHistory } from "@/hooks/use-track-history";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

export function RecentlyFoundTracks() {
  const { tracks, isLoading } = useTrackHistory({
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Recently Found Tracks</h2>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-4 p-4">
          {tracks.slice(0, 10).map((track) => (
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
                  <p className="font-medium truncate">{track.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
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
