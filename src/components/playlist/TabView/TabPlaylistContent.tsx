
import * as React from "react";
import GeneratedPlaylistTable from "@/components/playlist-table";
import type { Track } from "@/types/table";

interface TabPlaylistContentProps {
  filteredTracks: Track[];
  userLikedTrackIds?: string[];
  onLikeChange?: (trackId: string, liked: boolean) => void;
  playlistName: string;
  visibleColumns: Record<string, boolean>;
}

/**
 * Component that renders the playlist content within each tab
 */
export default function TabPlaylistContent({
  filteredTracks,
  userLikedTrackIds = [],
  onLikeChange,
  playlistName,
  visibleColumns,
}: TabPlaylistContentProps) {
  // Handler to pass like changes up to parent
  const handleLikeChange = React.useCallback((trackId: string, liked: boolean) => {
    console.log(`Like change in TabPlaylistContent: ${trackId}, liked: ${liked}`);
    if (onLikeChange) {
      onLikeChange(trackId, liked);
    }
  }, [onLikeChange]);
  
  return (
    <GeneratedPlaylistTable
      tracks={filteredTracks}
      userLikedTrackIds={userLikedTrackIds}
      onLikeChange={handleLikeChange}
      playlistName={playlistName}
      fullWidth={true}
      showLikeButton={true}
      showControls={false}
      showPagination={true}
      columnVisibility={visibleColumns}
    />
  );
}
