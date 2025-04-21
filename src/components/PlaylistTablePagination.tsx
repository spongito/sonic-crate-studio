
import React from "react";
import { Button } from "@/components/ui/button";

type PlaylistTablePaginationProps = {
  table: any;
};

export default function PlaylistTablePagination({ table }: PlaylistTablePaginationProps) {
  // Compute the page counters and navigation.
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const totalRows = table.getFilteredRowModel().rows.length;

  if (totalRows === 0) return null;
  return (
    <div className="flex items-center justify-end space-x-2 py-4 px-6">
      <div className="text-xs text-muted-foreground">
        Showing {pageIndex * pageSize + 1} to{" "}
        {Math.min((pageIndex + 1) * pageSize, totalRows)} of {totalRows} entries
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
