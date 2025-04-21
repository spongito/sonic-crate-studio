
import React from "react";
import { TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { flexRender } from "@tanstack/react-table";
import { Table } from "@tanstack/react-table";

type PlaylistTableHeaderProps = {
  table: any;
  columns: any[];
};

export default function PlaylistTableHeader({ table, columns }: PlaylistTableHeaderProps) {
  return (
    <TableHeader className="bg-muted/50">
      {table.getHeaderGroups().map((headerGroup: any) => (
        <TableRow key={headerGroup.id} className="hover:bg-transparent">
          {headerGroup.headers.map((header: any) => (
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
