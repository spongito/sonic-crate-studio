
import * as React from "react";
import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import type { Track } from "./types";

interface PlaylistTableControlsProps {
  table: Table<Track>;
  showControls: boolean;
  columns: any[];
  onToggleColumn: (columnId: string) => void;
}

export function PlaylistTableControls({
  table,
  showControls,
  columns,
  onToggleColumn,
}: PlaylistTableControlsProps) {
  if (!showControls) return null;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <Input
        placeholder="Filter tracks..."
        value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
        onChange={(event) => 
          table.getColumn("title")?.setFilterValue(event.target.value)
        }
        className="w-full sm:max-w-xs"
      />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="ml-auto">
            Columns <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {columns.map((column) => {
            // Skip columns that can't be hidden
            if (!column.accessorKey || column.id === "actions") return null;
            
            return (
              <DropdownMenuCheckboxItem
                key={column.accessorKey}
                className="capitalize"
                checked={column.id ? table.getColumn(column.id)?.getIsVisible() : false}
                onCheckedChange={(value) => {
                  if (column.id) {
                    table.getColumn(column.id)?.toggleVisibility(!!value);
                    onToggleColumn(column.id);
                  }
                }}
              >
                {column.header || column.accessorKey}
              </DropdownMenuCheckboxItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
