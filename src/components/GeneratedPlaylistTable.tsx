
import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Heart, HeartOff } from "lucide-react";

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
};

// Export this type to be used in other components
export type GeneratedTrack = Track;

export interface GeneratedPlaylistTableProps {
  tracks: Track[];
  showSelection?: boolean;
  showLikeButton?: boolean;
  onLikeToggle?: (trackId: string) => void;
  // Additional props used in other components
  userLikedTrackIds?: string[];
  showControls?: boolean;
  fullWidth?: boolean;
  playlistName?: string;
  className?: string;
  onLikeChange?: (trackId: string, liked: boolean) => void;
}

export function GeneratedPlaylistTable({
  tracks,
  showSelection = true,
  showLikeButton = true,
  onLikeToggle,
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

  // Handle like toggle from both possible handler props
  const handleLikeToggle = (trackId: string) => {
    const trackIndex = tracks.findIndex(t => t.id === trackId);
    if (trackIndex >= 0) {
      const isCurrentlyLiked = tracks[trackIndex].liked === true;
      
      // Call both handlers if provided
      if (onLikeToggle) onLikeToggle(trackId);
      if (onLikeChange) onLikeChange(trackId, !isCurrentlyLiked);
    }
  };

  const columns: ColumnDef<Track>[] = [
    ...(showSelection
      ? [
          {
            id: "select",
            header: ({ table }) => (
              <Checkbox
                checked={
                  table.getIsAllPageRowsSelected() ||
                  (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) =>
                  table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
                className="translate-y-[2px]"
              />
            ),
            cell: ({ row }) => (
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="translate-y-[2px]"
              />
            ),
            enableSorting: false,
            enableHiding: false,
          } as ColumnDef<Track>,
        ]
      : []),
    {
      accessorKey: "title",
      header: "Track",
      cell: ({ row }) => {
        const track = row.original;
        const imageUrl = track.albumArt || track.image_url;
        const artistDisplay = Array.isArray(track.artist) 
          ? track.artist.join(", ") 
          : track.artist;

        return (
          <div className="flex items-center gap-3 py-1">
            <img 
              src={imageUrl} 
              alt={`${track.title} cover`} 
              className="w-10 h-10 rounded-md shadow-sm object-cover" 
              onError={(e) => {
                e.currentTarget.src = "/album-placeholder.svg";
              }}
            />
            <div className="flex flex-col">
              <div className="font-medium text-sm">{track.title}</div>
              <div className="text-xs text-muted-foreground">{artistDisplay}</div>
            </div>
          </div>
        );
      },
    },
    { 
      accessorKey: "album", 
      header: "Album",
      cell: ({ row }) => <span className="text-sm">{row.getValue("album")}</span>,
    },
    { 
      accessorKey: "platform", 
      header: "Platform", 
      cell: ({ row }) => {
        const platform = row.original.platform;
        const platformText = Array.isArray(platform) ? platform.join(", ") : platform;
        return <div className="text-sm">{platformText}</div>;
      }
    },
    { 
      accessorKey: "bpm", 
      header: "BPM",
      cell: ({ row }) => <span className="text-sm">{row.getValue("bpm")}</span>,
    },
    { 
      accessorKey: "key_signature", 
      header: "Key",
      cell: ({ row }) => {
        const keyValue = row.original.key_signature || row.original.key;
        return <span className="text-sm">{keyValue}</span>;
      },
    },
    { 
      accessorKey: "genre", 
      header: "Genre",
      cell: ({ row }) => {
        const genre = row.original.genre;
        const genreText = Array.isArray(genre) 
          ? genre.join(", ") 
          : typeof genre === 'string' ? genre : '';
        return <span className="text-sm">{genreText}</span>;
      },
    },
    { 
      accessorKey: "release_year", 
      header: "Year",
      cell: ({ row }) => {
        const year = row.original.release_year || row.original.year;
        return <span className="text-sm">{year}</span>;
      },
    },
    { 
      accessorKey: "duration", 
      header: "Duration",
      cell: ({ row }) => <span className="text-sm">{row.getValue("duration")}</span>,
    },
    ...(showLikeButton
      ? [
          {
            id: "like",
            header: "",
            cell: ({ row }) => {
              const track = row.original;
              const liked = track.liked ?? userLikedTrackIds.includes(track.id);
              return (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleLikeToggle(track.id)}
                  className="h-8 w-8 rounded-full hover:bg-muted/80"
                >
                  {liked ? (
                    <Heart className="h-4 w-4 text-primary" fill="currentColor" />
                  ) : (
                    <HeartOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              );
            },
          } as ColumnDef<Track>,
        ]
      : []),
  ];

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

  if (playlistName) {
    return (
      <div className={`w-full space-y-4 ${className}`}>
        <h3 className="font-medium text-lg pl-6">{playlistName}</h3>
        <RenderTableContent table={table} columns={columns} showControls={showControls} />
      </div>
    );
  }

  return (
    <div className={`w-full space-y-4 ${className}`}>
      <RenderTableContent table={table} columns={columns} showControls={showControls} />
    </div>
  );
}

// Helper component to avoid code duplication
function RenderTableContent({ 
  table, 
  columns,
  showControls = true 
}: { 
  table: any, 
  columns: ColumnDef<Track>[], 
  showControls?: boolean 
}) {
  return (
    <>
      {showControls && (
        <div className="flex flex-col sm:flex-row items-center py-4 gap-4 px-6">
          <Input
            placeholder="Search tracks..."
            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("title")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      <div className="overflow-hidden">
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead 
                      key={header.id}
                      className="text-xs font-medium text-muted-foreground"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row, index) => (
                  <TableRow 
                    key={row.id} 
                    data-state={row.getIsSelected() && "selected"}
                    className={`hover:bg-muted/50 transition-colors ${
                      index % 2 === 0 ? "bg-background" : "bg-muted/20"
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-36 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="text-2xl">🎵</span>
                      <span className="text-muted-foreground">
                        Nothing found! Try adjusting your search or filters.
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {table.getFilteredRowModel().rows.length > 0 && showControls && (
        <div className="flex items-center justify-end space-x-2 py-4 px-6">
          <div className="text-xs text-muted-foreground">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{" "}
            of {table.getFilteredRowModel().rows.length} entries
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
