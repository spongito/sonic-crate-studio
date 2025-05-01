
import * as React from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import type { Track } from "@/types/table";
import { PlaylistTitle } from "@/components/playlist/PlaylistTitle";
import { PlaylistEditModal } from "@/components/Playlists/PlaylistEditModal";
import { toast } from "sonner";
import { useTableColumns } from "@/hooks/use-table-columns";
import PlaylistControls from "./PlaylistControls";
import TabPlaylistContent from "./TabPlaylistContent";
import { useTracks } from "./useTracks";

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

/**
 * A component that displays playlist tracks with filtering by platform and search
 */
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

  // Use custom hook to filter tracks
  const { filteredTracks } = useTracks(tracks, userLikedTrackIds, activePlatform, searchTerm);

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
        <PlaylistControls
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          activePlatform={activePlatform}
          visibleColumns={visibleColumns}
          toggleColumn={toggleColumn}
          onSavePlaylist={onSavePlaylist}
          onRename={() => setIsRenaming(true)}
          onShare={handleShare}
          onEdit={() => setIsEditing(true)}
        />
        
        <TabsContent value="all" className="mt-4">
          <TabPlaylistContent 
            filteredTracks={filteredTracks}
            userLikedTrackIds={userLikedTrackIds}
            onLikeChange={onLikeChange}
            playlistName={currentPlaylistName}
            visibleColumns={visibleColumns}
          />
        </TabsContent>
        
        <TabsContent value="spotify" className="mt-4">
          <TabPlaylistContent 
            filteredTracks={filteredTracks}
            userLikedTrackIds={userLikedTrackIds}
            onLikeChange={onLikeChange}
            playlistName={currentPlaylistName}
            visibleColumns={visibleColumns}
          />
        </TabsContent>
        
        <TabsContent value="youtube" className="mt-4">
          <TabPlaylistContent 
            filteredTracks={filteredTracks}
            userLikedTrackIds={userLikedTrackIds}
            onLikeChange={onLikeChange}
            playlistName={currentPlaylistName}
            visibleColumns={visibleColumns}
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
