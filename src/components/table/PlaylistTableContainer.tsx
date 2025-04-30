
import * as React from "react";
import { Table } from "@/components/ui/table";
import { TableHeaders } from "./TableHeaders";
import { TableRows } from "./TableRows";
import type { Table as TableType } from "@tanstack/react-table";
import type { Track } from "@/types/table";

interface PlaylistTableContainerProps {
  table: TableType<Track>;
  columns: any[];
  handleRowClick: (event: React.MouseEvent, rowIndex: number) => void;
}

export function PlaylistTableContainer({ 
  table, 
  columns, 
  handleRowClick 
}: PlaylistTableContainerProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-muted">
      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeaders table={table} />
          <TableRows 
            table={table} 
            columns={columns} 
            handleRowClick={handleRowClick} 
          />
        </Table>
      </div>
    </div>
  );
}
