
import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GeneratedPlaylistTable from "./GeneratedPlaylistTable";
import { Track } from "./GeneratedPlaylistTable";
import { Button } from "./ui/button";
import { Apple, ExternalLink, Plus, Save, Youtube } from "lucide-react";

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
  
  // Get unique platforms from tracks
  const platforms = React.useMemo(() => {
    const platformSet = new Set<string>();
    tracks.forEach((track) => {
      if (Array.isArray(track.platform)) {
        track.platform.forEach(p => platformSet.add(p));
      } else if (track.platform) {
        platformSet.add(track.platform as string);
      }
    });
    return Array.from(platformSet);
  }, [tracks]);
  
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

  // Get platform icon
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'spotify':
        return <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center" />;
      case 'apple music':
      case 'apple':
        return <Apple className="w-4 h-4" />;
      case 'youtube':
        return <Youtube className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-5 h-5 rounded-full bg-gray-500" />;
    }
  };

  // Handle add to library action
  const handleAddToLibrary = (trackId: string) => {
    if (onAddToLibrary) onAddToLibrary(trackId);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Tabs defaultValue="all" onValueChange={setActivePlatform} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all" className="px-4">
            All Platforms
          </TabsTrigger>
          {platforms.map(platform => (
            <TabsTrigger key={platform} value={platform} className="px-4 flex items-center gap-2">
              {getPlatformIcon(platform)}
              <span className="capitalize">{platform}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value={activePlatform} className="mt-0">
          <div className="flex justify-end mb-4">
            {activePlatform !== "all" && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onSavePlaylist?.(activePlatform)}
                className="flex items-center gap-1"
              >
                <Save className="h-4 w-4" />
                Save to {activePlatform}
              </Button>
            )}
          </div>
          
          <GeneratedPlaylistTable 
            tracks={filteredTracks}
            userLikedTrackIds={userLikedTrackIds} 
            onLikeChange={onLikeChange}
            playlistName={playlistName}
            fullWidth={true}
            showLikeButton={true}
            showAddToLibrary={true}
            onAddToLibrary={handleAddToLibrary}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
