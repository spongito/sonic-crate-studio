import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GeneratedPlaylistTable from "./GeneratedPlaylistTable";
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
  
  const filteredTracks = React.useMemo(() => {
    let filtered = tracks;
    
    if (activePlatform !== "all") {
      filtered = filtered.filter(track => {
        if (Array.isArray(track.platform)) {
          return track.platform.includes(activePlatform);
        } 
        return track.platform === activePlatform;
      });
    }
    
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
      <h2 className="text-2xl font-bold px-6">{playlistName}</h2>
      
      <div className="flex items-center gap-4 px-6">
        <Tabs value={activePlatform} onValueChange={setActivePlatform} className="flex-1">
          <TabsList>
            <TabsTrigger value="all">All Platforms</TabsTrigger>
            <TabsTrigger value="spotify">Spotify</TabsTrigger>
            <TabsTrigger value="youtube">YouTube</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-4">
          <Input
            placeholder="Search tracks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[200px]"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
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
          showControls={false}
          columnVisibility={columnVisibility}
        />
      </TabsContent>
    </div>
  );
}
