
import * as React from "react";
import {
  ColumnFiltersState,
  SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { Track } from "@/types/table";
import type { ColumnDef } from "@tanstack/react-table";

interface UseTableStateProps {
  data: Track[];
  columns: ColumnDef<Track>[];
  columnVisibility?: Record<string, boolean>;
}

export function useTableState({
  data,
  columns,
  columnVisibility,
}: UseTableStateProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
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
      columnVisibility: columnVisibility || {},
      rowSelection,
    },
    enableRowSelection: true,
  });

  return {
    table,
    sorting,
    columnFilters,
    rowSelection,
  };
}
