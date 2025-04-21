
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
  artist: string;
  album: string;
  bpm: number;
  key: string;
  genre: string;
  year: number;
  duration: string;
  albumArt: string;
  platform: string[];
  liked?: boolean;
};

interface GeneratedPlaylistTableProps {
  tracks: Track[];
  showSelection?: boolean;
  showLikeButton?: boolean;
  onLikeToggle?: (trackId: string) => void;
}

export function GeneratedPlaylistTable({
  tracks,
  showSelection = true,
  showLikeButton = true,
  onLikeToggle,
}: GeneratedPlaylistTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    platform: false,
    year: false,
  });
  const [rowSelection, setRowSelection] = React.useState({});

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
        return (
          <div className="flex items-center gap-3 py-1">
            <img 
              src={track.albumArt} 
              alt={`${track.title} cover`} 
              className="w-10 h-10 rounded-md shadow-sm object-cover" 
              onError={(e) => {
                e.currentTarget.src = "/album-placeholder.svg";
              }}
            />
            <div className="flex flex-col">
              <div className="font-medium text-sm">{track.title}</div>
              <div className="text-xs text-muted-foreground">{track.artist}</div>
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
      cell: ({ row }) => (
        <div className="text-sm">{Array.isArray(row.original.platform) ? row.original.platform.join(", ") : row.original.platform}</div>
      ),
    },
    { 
      accessorKey: "bpm", 
      header: "BPM",
      cell: ({ row }) => <span className="text-sm">{row.getValue("bpm")}</span>,
    },
    { 
      accessorKey: "key", 
      header: "Key",
      cell: ({ row }) => <span className="text-sm">{row.getValue("key")}</span>,
    },
    { 
      accessorKey: "genre", 
      header: "Genre",
      cell: ({ row }) => <span className="text-sm">{row.getValue("genre")}</span>,
    },
    { 
      accessorKey: "year", 
      header: "Year",
      cell: ({ row }) => <span className="text-sm">{row.getValue("year")}</span>,
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
              const liked = track.liked ?? false;
              return (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onLikeToggle?.(track.id)}
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

  return (
    <div className="w-full space-y-4">
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
      {table.getFilteredRowModel().rows.length > 0 && (
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
    </div>
  );
}
