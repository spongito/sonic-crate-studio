
import * as React from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import GeneratedPlaylistTable from "./GeneratedPlaylistTable";
import { PlaylistHeader } from "./playlist/PlaylistHeader";
import type { Track } from "@/types/table";

interface TabPlaylistViewProps {
  tracks: Track[];
  playlistName?: string;
  onLikeChange?: (trackId: string, liked: boolean) => void;
  onAddToLibrary?: (trackId: string) => void;
  onSavePlaylist?: (platform: string) => void;
  userLikedTrackIds?: string[];
  className?: string;
}

export default function TabPlaylistView({
  tracks,
  playlistName = "Generated Playlist",
  onLikeChange,
  onAddToLibrary,
  onSavePlaylist,
  userLikedTrackIds = [],
  className = "",
}: TabPlaylistViewProps) {
  const [activePlatform, setActivePlatform] = React.useState<string>("all");
  
  // Filter tracks based on active platform
  const filteredTracks = React.useMemo(() => {
    if (activePlatform === "all") return tracks;
    
    return tracks.filter(track => {
      if (Array.isArray(track.platform)) {
        return track.platform.includes(activePlatform);
      } 
      return track.platform === activePlatform;
    });
  }, [tracks, activePlatform]);

  const handleTitleChange = (newTitle: string) => {
    // Handle playlist title change (to be implemented)
    console.log("New playlist title:", newTitle);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <PlaylistHeader
        title={playlistName}
        onTitleChange={handleTitleChange}
        onPlatformChange={setActivePlatform}
        initialPlatform={activePlatform}
      />
      
      {/* Wrap TabsContent within a Tabs component with the correct value */}
      <Tabs value={activePlatform} onValueChange={setActivePlatform}>
        <TabsContent value={activePlatform} className="mt-0">
          <GeneratedPlaylistTable 
            tracks={filteredTracks}
            userLikedTrackIds={userLikedTrackIds} 
            onLikeChange={onLikeChange}
            playlistName={playlistName}
            fullWidth={true}
            showLikeButton={true}
            showAddToLibrary={true}
            onAddToLibrary={onAddToLibrary}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
