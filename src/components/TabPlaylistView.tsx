
import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GeneratedPlaylistTable from "./GeneratedPlaylistTable";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import type { Track } from "@/types/table";
import { PlaylistTitle } from "./playlist/PlaylistTitle";
import { PlaylistMenu } from "./playlist/PlaylistMenu";
import { useTableColumns } from "@/hooks/use-table-columns";

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
  const { visibleColumns, toggleColumn } = useTableColumns();
  const [isRenaming, setIsRenaming] = React.useState(false);

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
  
  const handleShare = () => {
    console.log("Sharing playlist");
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between px-6">
        <PlaylistTitle 
          title={playlistName} 
          onTitleChange={handleTitleChange}
        />
      </div>
      
      <Tabs value={activePlatform} onValueChange={setActivePlatform} className="w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6">
          <SearchInput
            placeholder="Search tracks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-[200px]"
          />

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="all">All Platforms</TabsTrigger>
              <TabsTrigger value="spotify">Spotify</TabsTrigger>
              <TabsTrigger value="youtube">YouTube</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <PlaylistMenu 
                onSave={() => onSavePlaylist?.("all")}
                onRename={() => setIsRenaming(true)}
                onShare={handleShare}
              />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    Columns <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover">
                  {Object.keys(visibleColumns).map((columnId) => (
                    <DropdownMenuCheckboxItem
                      key={columnId}
                      className="capitalize"
                      checked={visibleColumns[columnId]}
                      onCheckedChange={() => toggleColumn(columnId)}
                    >
                      {columnId.replace('_', ' ')}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        
        <TabsContent value="all" className="mt-4">
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
            showPagination={true}
            columnVisibility={visibleColumns}
          />
        </TabsContent>
        
        <TabsContent value="spotify" className="mt-4">
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
            showPagination={true}
            columnVisibility={visibleColumns}
          />
        </TabsContent>
        
        <TabsContent value="youtube" className="mt-4">
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
            showPagination={true}
            columnVisibility={visibleColumns}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
