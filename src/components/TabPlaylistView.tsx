
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
import { PlaylistEditModal } from "./Playlists/PlaylistEditModal";
import { toast } from "sonner";

interface TabPlaylistViewProps {
  tracks: Track[];
  playlistName?: string;
  coverImageUrl?: string;
  onLikeChange?: (trackId: string, liked: boolean) => void;
  onSavePlaylist?: (platform: string) => void;
  onPlaylistUpdate?: (name: string, coverUrl: string) => Promise<boolean>;
  userLikedTrackIds?: string[];
  className?: string;
}

export default function TabPlaylistView({
  tracks,
  playlistName = "Generated Playlist",
  coverImageUrl,
  onLikeChange,
  onSavePlaylist,
  onPlaylistUpdate,
  userLikedTrackIds = [],
  className = "",
}: TabPlaylistViewProps) {
  const [activePlatform, setActivePlatform] = React.useState<string>("all");
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const { visibleColumns, toggleColumn } = useTableColumns();
  const [isRenaming, setIsRenaming] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [currentPlaylistName, setCurrentPlaylistName] = React.useState(playlistName);
  const [currentCoverUrl, setCurrentCoverUrl] = React.useState(coverImageUrl);

  // Update local state when props change
  React.useEffect(() => {
    setCurrentPlaylistName(playlistName);
  }, [playlistName]);

  React.useEffect(() => {
    setCurrentCoverUrl(coverImageUrl);
  }, [coverImageUrl]);

  // Process tracks to include liked status based on userLikedTrackIds
  const processedTracks = React.useMemo(() => {
    return tracks.map(track => ({
      ...track,
      liked: userLikedTrackIds?.includes(track.id) || track.liked || false
    }));
  }, [tracks, userLikedTrackIds]);

  const filteredTracks = React.useMemo(() => {
    let filtered = processedTracks;
    
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
  }, [processedTracks, activePlatform, searchTerm]);

  const handleTitleChange = async (newTitle: string) => {
    setCurrentPlaylistName(newTitle);
    
    if (onPlaylistUpdate) {
      try {
        const success = await onPlaylistUpdate(newTitle, currentCoverUrl || '');
        if (!success) {
          // Revert to original name if update failed
          setCurrentPlaylistName(playlistName);
          toast.error('Failed to update playlist title');
        }
      } catch (error) {
        console.error('Error updating playlist title:', error);
        // Revert to original name if update failed
        setCurrentPlaylistName(playlistName);
        toast.error('Failed to update playlist title');
      }
    } else {
      console.log("New playlist title:", newTitle);
    }
  };

  const handleEditSave = async (name: string, coverUrl: string) => {
    if (onPlaylistUpdate) {
      try {
        const success = await onPlaylistUpdate(name, coverUrl);
        if (success) {
          setCurrentPlaylistName(name);
          setCurrentCoverUrl(coverUrl);
          setIsEditing(false);
        } else {
          toast.error('Failed to update playlist');
        }
      } catch (error) {
        console.error('Error updating playlist:', error);
        toast.error('Failed to update playlist');
      }
    } else {
      // If no update handler provided, just update local state
      setCurrentPlaylistName(name);
      setCurrentCoverUrl(coverUrl);
      setIsEditing(false);
    }
  };
  
  const handleShare = () => {
    console.log("Sharing playlist");
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between px-6">
        <PlaylistTitle 
          title={currentPlaylistName}
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
                onEdit={() => setIsEditing(true)}
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
            playlistName={currentPlaylistName}
            fullWidth={true}
            showLikeButton={true}
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
            playlistName={currentPlaylistName}
            fullWidth={true}
            showLikeButton={true}
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
            playlistName={currentPlaylistName}
            fullWidth={true}
            showLikeButton={true}
            showControls={false}
            showPagination={true}
            columnVisibility={visibleColumns}
          />
        </TabsContent>
      </Tabs>
      
      {/* Playlist Edit Modal */}
      <PlaylistEditModal
        isOpen={isEditing}
        playlistName={currentPlaylistName}
        coverImageUrl={currentCoverUrl || ''}
        onClose={() => setIsEditing(false)}
        onSave={handleEditSave}
      />
    </div>
  );
}
