
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Table } from "@tanstack/react-table";
import { Track } from "@/types/table";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TablePaginationProps {
  table: Table<Track>;
  showControls: boolean;
}

export function TablePagination({ table, showControls }: TablePaginationProps) {
  if (!table.getFilteredRowModel().rows.length || !showControls) return null;

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 px-6">
      <div className="text-xs text-muted-foreground">
        Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
        {Math.min(
          (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
          table.getFilteredRowModel().rows.length
        )}{" "}
        of {table.getFilteredRowModel().rows.length} entries
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        
        <div className="flex items-center justify-center text-sm">
          <span>Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          aria-label="Next page"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
