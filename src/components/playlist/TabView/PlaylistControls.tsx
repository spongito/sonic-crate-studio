
import * as React from "react";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlaylistMenu } from "@/components/playlist/PlaylistMenu";

interface PlaylistControlsProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  activePlatform: string;
  visibleColumns: Record<string, boolean>;
  toggleColumn: (columnId: string) => void;
  onSavePlaylist?: (platform: string) => void;
  onRename: () => void;
  onShare: () => void;
  onEdit: () => void;
}

/**
 * Component for playlist controls including search, platform tabs, and actions
 */
export default function PlaylistControls({
  searchTerm,
  setSearchTerm,
  activePlatform,
  visibleColumns,
  toggleColumn,
  onSavePlaylist,
  onRename,
  onShare,
  onEdit,
}: PlaylistControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6">
      <SearchInput
        placeholder="Search tracks..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full sm:w-[200px]"
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="all">All Platforms</TabsTrigger>
          <TabsTrigger value="spotify">Spotify</TabsTrigger>
          <TabsTrigger value="youtube">YouTube</TabsTrigger>
        </TabsList>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <PlaylistMenu
            onSave={() => onSavePlaylist?.("all")}
            onRename={onRename}
            onShare={onShare}
            onEdit={onEdit}
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover">
              {Object.keys(visibleColumns).map((columnId) => (
                <DropdownMenuCheckboxItem
                  key={columnId}
                  className="capitalize"
                  checked={visibleColumns[columnId]}
                  onCheckedChange={() => toggleColumn(columnId)}
                >
                  {columnId.replace("_", " ")}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
