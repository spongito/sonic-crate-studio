
import * as React from "react";
import { useTableColumns } from "@/hooks/use-table-columns";
import { usePlaylistTableColumns } from "@/hooks/use-playlist-table-columns";
import { useTableRowSelection } from "@/hooks/use-table-row-selection";
import { useTableState } from "@/hooks/useTableState";
import { PlaylistTableContainer } from "@/components/table/PlaylistTableContainer";
import { TablePagination } from "@/components/table/TablePagination";
import { PlaylistTableControls } from "./PlaylistTableControls";
import { useTrackProcessor } from "./useTrackProcessor";
import type { PlaylistTableProps } from "./types";

export function GeneratedPlaylistTable({
  tracks,
  showSelection = true,
  showLikeButton = true,
  userLikedTrackIds = [],
  showControls = true,
  showPagination,
  fullWidth = false,
  playlistName,
  className = "",
  onLikeChange,
  columnVisibility,
}: PlaylistTableProps) {
  const { visibleColumns, toggleColumn } = useTableColumns();
  
  // Process tracks to include liked status
  const { tracksWithLikedStatus } = useTrackProcessor(tracks, userLikedTrackIds);
  
  const columns = usePlaylistTableColumns({ 
    showLikeButton, 
    onLikeChange, 
    userLikedTrackIds 
  });

  // Default showPagination to showControls if not explicitly set
  const shouldShowPagination = showPagination !== undefined ? showPagination : showControls;

  // Combine default visibility with passed columnVisibility prop
  const effectiveColumnVisibility = React.useMemo(() => {
    if (columnVisibility) {
      return columnVisibility;
    }
    return visibleColumns;
  }, [columnVisibility, visibleColumns]);

  const { table } = useTableState({
    data: tracksWithLikedStatus,
    columns,
    columnVisibility: effectiveColumnVisibility,
  });

  const { handleRowClick } = useTableRowSelection(table);

  return (
    <div className={`w-full space-y-4 ${className}`}>
      <PlaylistTableControls 
        table={table} 
        showControls={showControls} 
        columns={columns}
        onToggleColumn={toggleColumn}
      />
      <PlaylistTableContainer 
        table={table} 
        columns={columns} 
        handleRowClick={handleRowClick} 
      />
      <TablePagination table={table} showPagination={shouldShowPagination} />
    </div>
  );
}

export default GeneratedPlaylistTable;
