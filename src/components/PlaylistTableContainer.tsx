
import React from "react";
import { Table } from "@/components/ui/table";
import PlaylistTableHeader from "./PlaylistTableHeader";
import PlaylistTableBody from "./PlaylistTableBody";
import PlaylistTablePagination from "./PlaylistTablePagination";

type PlaylistTableContainerProps = {
  table: any;
  columns: any[];
  playlistName?: string;
  showControls?: boolean;
  columnsLength: number;
  ControlsComponent?: React.ReactNode;
};

export default function PlaylistTableContainer({
  table,
  columns,
  playlistName,
  showControls = true,
  columnsLength,
  ControlsComponent,
}: PlaylistTableContainerProps) {
  return (
    <div className="w-full space-y-4">
      {playlistName && (
        <h3 className="font-medium text-lg pl-6">{playlistName}</h3>
      )}
      {ControlsComponent}
      <div className="overflow-hidden rounded-lg border border-muted">
        <div className="relative w-full overflow-auto">
          <Table>
            <PlaylistTableHeader table={table} columns={columns} />
            <PlaylistTableBody table={table} columns={columns} />
          </Table>
        </div>
      </div>
      {showControls && (
        <PlaylistTablePagination table={table} />
      )}
    </div>
  );
}
