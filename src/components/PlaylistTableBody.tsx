
import React from "react";
import { TableBody, TableRow, TableCell } from "@/components/ui/table";
import { flexRender } from "@tanstack/react-table";

interface PlaylistTableBodyProps {
  table: any;
  columns: any[];
}

export default function PlaylistTableBody({ table, columns }: PlaylistTableBodyProps) {
  const rows = table.getRowModel().rows;
  return (
    <TableBody>
      {rows.length ? (
        rows.map((row: any, index: number) => (
          <TableRow
            key={row.id}
            data-state={row.getIsSelected() && "selected"}
            className={`hover:bg-muted/50 transition-colors ${index % 2 === 0 ? "bg-background" : "bg-muted/20"}`}
          >
            {row.getVisibleCells().map((cell: any) => (
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
  );
}
