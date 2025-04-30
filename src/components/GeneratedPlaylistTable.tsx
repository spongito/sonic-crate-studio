
import * as React from "react";
import { useTableColumns } from "@/hooks/use-table-columns";
import { usePlaylistTableColumns } from "@/hooks/use-playlist-table-columns";
import PlaylistTableControls from "./PlaylistTableControls";
import { TablePagination } from "./table/TablePagination";
import { PlaylistTableContainer } from "./table/PlaylistTableContainer";
import { useTableRowSelection } from "@/hooks/use-table-row-selection";
import { useTableState } from "@/hooks/useTableState";
import type { Track, TableProps } from "@/types/table";

export type { Track };
export type GeneratedTrack = Track;

interface ExtendedTableProps extends TableProps {
  columnVisibility?: Record<string, boolean>;
  showPagination?: boolean;
}

export function GeneratedPlaylistTable({
  tracks,
  showSelection = true,
  showLikeButton = true,
  showAddToLibrary = false,
  onLikeToggle,
  onAddToLibrary,
  userLikedTrackIds = [],
  showControls = true,
  showPagination,
  fullWidth = false,
  playlistName,
  className = "",
  onLikeChange,
  columnVisibility,
}: ExtendedTableProps) {
  const { visibleColumns, toggleColumn } = useTableColumns();
  const columns = usePlaylistTableColumns({ 
    showLikeButton, 
    showAddToLibrary, 
    onLikeToggle, 
    onLikeChange, 
    onAddToLibrary, 
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
    data: tracks,
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
