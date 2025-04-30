
import * as React from "react";
import {
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { flexRender } from "@tanstack/react-table";
import { EmptyTableState } from "./EmptyTableState";
import type { Table } from "@tanstack/react-table";
import type { Track } from "@/types/table";

interface TableRowsProps {
  table: Table<Track>;
  columns: any[];
  handleRowClick: (event: React.MouseEvent, rowIndex: number) => void;
}

export function TableRows({ table, columns, handleRowClick }: TableRowsProps) {
  return (
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
  );
}
