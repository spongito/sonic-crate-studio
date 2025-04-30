
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
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [lastSelectedRowIndex, setLastSelectedRowIndex] = React.useState<number | null>(null);
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
    enableRowSelection: true,
  });

  // Handle row click with keyboard modifiers for selection
  const handleRowClick = (event: React.MouseEvent, rowIndex: number) => {
    const { shiftKey, metaKey, ctrlKey } = event;
    const isModifierKeyPressed = metaKey || ctrlKey; // Meta for Mac, Ctrl for Windows
    
    if (shiftKey && lastSelectedRowIndex !== null) {
      // Range selection with shift key
      const start = Math.min(lastSelectedRowIndex, rowIndex);
      const end = Math.max(lastSelectedRowIndex, rowIndex);
      
      // Create a new selection object, preserving existing selections if modifier key is pressed
      const newSelection = isModifierKeyPressed ? { ...table.getState().rowSelection } : {};
      
      // Select all rows in the range
      for (let i = start; i <= end; i++) {
        const row = table.getRowModel().rows[i];
        if (row) {
          newSelection[row.id] = true;
        }
      }
      
      // Update the table's row selection state
      table.setRowSelection(newSelection);
    } else {
      // Single row selection
      const row = table.getRowModel().rows[rowIndex];
      if (row) {
        if (isModifierKeyPressed) {
          // Toggle this row's selection without affecting others if modifier key is pressed
          const isSelected = table.getState().rowSelection[row.id] ?? false;
          table.setRowSelection({
            ...table.getState().rowSelection,
            [row.id]: !isSelected,
          });
        } else {
          // Check if this row is already selected
          const isSelected = table.getState().rowSelection[row.id] ?? false;
          if (isSelected) {
            // If already selected, deselect it (clear all selections)
            table.setRowSelection({});
          } else {
            // Clear selection and select only this row if no modifier key
            table.setRowSelection({
              [row.id]: true,
            });
          }
        }
      }
    }
    
    // Update the last selected row index
    setLastSelectedRowIndex(rowIndex);
  };

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
                    className={`hover:bg-muted/50 transition-colors cursor-pointer ${
                      index % 2 === 0 ? "bg-background" : "bg-muted/20"
                    }`}
                    onClick={(e) => handleRowClick(e, index)}
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
      <TablePagination table={table} showPagination={shouldShowPagination} />
    </div>
  );
}

export default GeneratedPlaylistTable;
