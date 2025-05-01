
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
  return (
    <GeneratedPlaylistTable
      tracks={filteredTracks}
      userLikedTrackIds={userLikedTrackIds}
      onLikeChange={onLikeChange}
      playlistName={playlistName}
      fullWidth={true}
      showLikeButton={true}
      showControls={false}
      showPagination={true}
      columnVisibility={visibleColumns}
    />
  );
}
