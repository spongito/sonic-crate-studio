
import * as React from "react";
import { TableCell, TableRow } from "@/components/ui/table";

interface EmptyTableStateProps {
  colSpan: number;
}

export function EmptyTableState({ colSpan }: EmptyTableStateProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-36 text-center">
        <div className="flex flex-col items-center justify-center gap-2">
          <span className="text-2xl">🎵</span>
          <span className="text-muted-foreground">
            Nothing found! Try adjusting your search or filters.
          </span>
        </div>
      </TableCell>
    </TableRow>
  );
}
