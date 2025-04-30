
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Table } from "@tanstack/react-table";
import { Track } from "@/types/table";

interface TablePaginationProps {
  table: Table<Track>;
  showPagination?: boolean;
}

export function TablePagination({ table, showPagination = true }: TablePaginationProps) {
  if (!table.getFilteredRowModel().rows.length || !showPagination) return null;

  return (
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
  );
}
