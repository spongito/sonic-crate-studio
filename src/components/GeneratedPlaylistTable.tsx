
// --- Imports ---
import * as React from "react";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import PlaylistTableControls from "./PlaylistTableControls";
import PlaylistTableContainer from "./PlaylistTableContainer";
import { getPlaylistTableColumns } from "./PlaylistTableColumns";

// --- Types ---
export type Track = {
  id: string;
  title: string;
  artist: string | string[];
  album: string;
  bpm: number | null;
  key_signature?: string;
  key?: string;
  genre: string | string[] | null;
  year?: number;
  release_year?: number;
  duration: string | number;
  albumArt?: string;
  image_url?: string;
  platform: string | string[];
  liked?: boolean;
  platform_url?: string;
  spotify_id?: string;
};

export type GeneratedTrack = Track;

export interface GeneratedPlaylistTableProps {
  tracks: Track[];
  showSelection?: boolean;
  showLikeButton?: boolean;
  showAddToLibrary?: boolean;
  onLikeToggle?: (trackId: string) => void;
  onAddToLibrary?: (trackId: string) => void;
  userLikedTrackIds?: string[];
  showControls?: boolean;
  fullWidth?: boolean;
  playlistName?: string;
  className?: string;
  onLikeChange?: (trackId: string, liked: boolean) => void;
}

// Main Table Component
export function GeneratedPlaylistTable({
  tracks,
  showSelection = true,
  showLikeButton = true,
  showAddToLibrary = false,
  onLikeToggle,
  onAddToLibrary,
  userLikedTrackIds = [],
  showControls = true,
  fullWidth = false,
  playlistName,
  className = "",
  onLikeChange,
}: GeneratedPlaylistTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    platform: false,
    year: false,
  });
  const [rowSelection, setRowSelection] = React.useState({});

  // Memoized columns to avoid unnecessary rerenders
  const columns = React.useMemo(
    () =>
      getPlaylistTableColumns({
        showSelection,
        showLikeButton,
        showAddToLibrary,
        onLikeToggle: onLikeToggle || (() => {}),
        onAddToLibrary,
        userLikedTrackIds,
        onLikeChange,
      }),
    [
      showSelection,
      showLikeButton,
      showAddToLibrary,
      onLikeToggle,
      onAddToLibrary,
      userLikedTrackIds,
      onLikeChange,
    ]
  );

  // --- Table Instance ---
  const table = useReactTable({
    data: tracks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  // Controls above the table
  const ControlsComponent = showControls ? (
    <PlaylistTableControls table={table} showControls={showControls} columns={columns} />
  ) : null;

  return (
    <div className={`w-full ${className}`}>
      <PlaylistTableContainer
        table={table}
        columns={columns}
        playlistName={playlistName}
        showControls={showControls}
        columnsLength={columns.length}
        ControlsComponent={ControlsComponent}
      />
    </div>
  );
}

export default GeneratedPlaylistTable;
