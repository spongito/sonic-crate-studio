// --- Imports ---
import * as React from "react";
import { useTableColumns } from "@/hooks/use-table-columns";
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
import { usePlaylistTableColumns } from "@/hooks/use-playlist-table-columns";
import PlaylistTableControls from "./PlaylistTableControls";
import { EmptyTableState } from "./table/EmptyTableState";
import { TablePagination } from "./table/TablePagination";
import type { Track, TableProps } from "@/types/table";

export type { Track };
export type GeneratedTrack = Track;

interface ExtendedTableProps extends TableProps {
  columnVisibility?: Record<string, boolean>;
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
  fullWidth = false,
  playlistName,
  className = "",
  onLikeChange,
  columnVisibility,
}: ExtendedTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const { visibleColumns, toggleColumn } = useTableColumns();
  const columns = usePlaylistTableColumns({ 
    showSelection, 
    showLikeButton, 
    showAddToLibrary, 
    onLikeToggle, 
    onLikeChange, 
    onAddToLibrary, 
    userLikedTrackIds 
  });

  // Combine default visibility with passed columnVisibility prop
  const effectiveColumnVisibility = React.useMemo(() => {
    if (columnVisibility) {
      return columnVisibility;
    }
    return visibleColumns;
  }, [columnVisibility, visibleColumns]);

  const table = useReactTable({
    data: tracks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility: effectiveColumnVisibility,
      rowSelection,
    },
  });

  return (
    <div className={`w-full space-y-4 ${className}`}>
      <PlaylistTableControls 
        table={table} 
        showControls={showControls} 
        columns={columns}
        onToggleColumn={toggleColumn}
      />
      <div className="overflow-hidden rounded-lg border border-muted">
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
                        : flexRender(header.column.columnDef.header, header.getContext())}
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
                      <TableCell 
                        key={cell.id} 
                        className="transition-all duration-300 ease-in-out"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <EmptyTableState colSpan={columns.length} />
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <TablePagination table={table} showControls={showControls} />
    </div>
  );
}

export default GeneratedPlaylistTable;
