
import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GeneratedPlaylistTable from "./GeneratedPlaylistTable";
import { PlaylistHeader } from "./playlist/PlaylistHeader";
import type { Track } from "@/types/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

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
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>({
    title: true,
    album: true,
    platform: true,
    bpm: true,
    key_signature: true,
    genre: true,
    release_year: true,
    duration: true
  });
  
  // Filter tracks based on active platform and search term
  const filteredTracks = React.useMemo(() => {
    let filtered = tracks;
    
    // Platform filter
    if (activePlatform !== "all") {
      filtered = filtered.filter(track => {
        if (Array.isArray(track.platform)) {
          return track.platform.includes(activePlatform);
        } 
        return track.platform === activePlatform;
      });
    }
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(track => {
        const title = track.title.toLowerCase();
        const artist = Array.isArray(track.artist) 
          ? track.artist.join(' ').toLowerCase() 
          : track.artist.toLowerCase();
        return title.includes(term) || artist.includes(term);
      });
    }
    
    return filtered;
  }, [tracks, activePlatform, searchTerm]);

  const handleTitleChange = (newTitle: string) => {
    // Handle playlist title change (to be implemented)
    console.log("New playlist title:", newTitle);
  };
  
  const handleToggleColumn = (columnId: string) => {
    setColumnVisibility(prev => ({
      ...prev,
      [columnId]: !prev[columnId]
    }));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col space-y-4">
        <PlaylistHeader
          title={playlistName}
          onTitleChange={handleTitleChange}
          onPlatformChange={setActivePlatform}
          initialPlatform={activePlatform}
        />
        
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center py-2 gap-4 px-6">
          <Input
            placeholder="Search tracks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover">
              {Object.keys(columnVisibility).map((columnId) => (
                <DropdownMenuCheckboxItem
                  key={columnId}
                  className="capitalize"
                  checked={columnVisibility[columnId]}
                  onCheckedChange={() => handleToggleColumn(columnId)}
                >
                  {columnId.replace('_', ' ')}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
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
            showControls={false} // Hide the default controls since we're using our custom ones
            columnVisibility={columnVisibility} // Pass the column visibility state
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
