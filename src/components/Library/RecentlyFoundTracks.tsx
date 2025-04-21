
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import TrackLikeButton from "@/components/TrackLikeButton";
import type { Track } from "@/types/table";
import { useState } from "react";
import { DebugPanel } from "@/components/Dashboard/MusicFinder/DebugPanel";

interface RecentlyFoundTracksProps {
  tracks: Track[];
  onLikeToggle: (trackId: string, liked: boolean) => void;
}

export function RecentlyFoundTracks({ tracks, onLikeToggle }: RecentlyFoundTracksProps) {
  const [showDebug, setShowDebug] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([
    `Tracks received: ${tracks?.length || 0}`,
    `Component rendered at: ${new Date().toISOString()}`,
  ]);
  
  // Log whenever the component receives new tracks
  if (tracks?.length) {
    console.log("RecentlyFoundTracks: Received tracks", tracks.length);
    console.log("RecentlyFoundTracks: First few tracks", tracks.slice(0, 3));
  }

  const handleLikeToggle = (trackId: string, liked: boolean) => {
    // Add debug log
    const newLog = `Track ${trackId} ${liked ? 'unliked' : 'liked'} at ${new Date().toISOString()}`;
    setDebugLogs(prev => [newLog, ...prev]);
    console.log(`RecentlyFoundTracks: ${newLog}`);
    
    // Call the actual handler
    onLikeToggle(trackId, liked);
  };
  
  if (!tracks || tracks.length === 0) {
    console.log("RecentlyFoundTracks: No tracks available to display");
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recently Found Tracks</h2>
        <div className="p-4 bg-muted/40 rounded-lg text-center">
          <p className="text-muted-foreground">No recently found tracks yet.</p>
        </div>
        <DebugPanel 
          showDebug={showDebug} 
          onToggleDebug={setShowDebug} 
          debugLogs={["No tracks available to display"]}
        />
      </div>
    );
  }

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
                    onError={(e) => {
                      console.error(`Image load error for track ${track.id}: ${track.title}`);
                      e.currentTarget.src = "/placeholder.svg";
                      setDebugLogs(prev => [`Image load error for ${track.id}: ${track.title}`, ...prev]);
                    }}
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
                      onToggle={() => handleLikeToggle(track.id, track.liked || false)}
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
      
      <DebugPanel 
        showDebug={showDebug} 
        onToggleDebug={setShowDebug} 
        debugLogs={debugLogs}
      />
    </div>
  );
}
