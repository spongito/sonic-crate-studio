
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { Track } from "@/types/table";

interface PlaylistTableControlsProps {
  table: any;
  columns: ColumnDef<Track>[];
  showControls?: boolean;
  onToggleColumn?: (columnId: string) => void;
}

export default function PlaylistTableControls({ 
  table, 
  showControls = true, 
  columns,
  onToggleColumn 
}: PlaylistTableControlsProps) {
  if (!showControls) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center py-4 gap-4 px-6">
      <Input
        placeholder="Search tracks..."
        value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
        onChange={(event) =>
          table.getColumn("title")?.setFilterValue(event.target.value)
        }
        className="max-w-sm"
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="ml-auto">
            Columns <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-popover">
          {table
            .getAllColumns()
            .filter((column: any) => column.getCanHide())
            .map((column: any) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => {
                  column.toggleVisibility(!!value);
                  if (onToggleColumn) {
                    onToggleColumn(column.id);
                  }
                }}
              >
                {column.id.replace('_', ' ')}
              </DropdownMenuCheckboxItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
