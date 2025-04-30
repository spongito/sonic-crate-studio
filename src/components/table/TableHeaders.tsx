
import * as React from "react";
import {
  TableHeader,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { flexRender } from "@tanstack/react-table";
import type { Table } from "@tanstack/react-table";
import type { Track } from "@/types/table";

interface TableHeadersProps {
  table: Table<Track>;
}

export function TableHeaders({ table }: TableHeadersProps) {
  return (
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
  );
}
