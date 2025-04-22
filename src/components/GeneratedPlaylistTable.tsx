
// --- Imports ---
import * as React from "react";
import { useTableColumns } from "@/hooks/use-table-columns";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePlaylistTableColumns } from "@/hooks/use-playlist-table-columns";
import PlaylistTableControls from "./PlaylistTableControls";
import { EmptyTableState } from "./table/EmptyTableState";
import { TablePagination } from "./table/TablePagination";
import type { Track, TableProps } from "@/types/table";
import { Button } from "./ui/button";
import { Play, Download, Copy, Share } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useMediaQuery } from "@/hooks/use-media-query";

export type { Track };
export type GeneratedTrack = Track;

interface EnhancedTableProps extends TableProps {
  columnVisibility?: Record<string, boolean>;
  failedPlatforms?: string[];
  topGenres?: string[];
  playlistId?: string;
  onGenreFilter?: (genre: string) => void;
  isPremium?: boolean;
}

export function GeneratedPlaylistTable({
  tracks,
  showSelection = true,
  showLikeButton = true,
  showAddToLibrary = false,
  onLikeToggle,
  onAddToLibrary,
  userLikedTrackIds = [],
  showControls = true,
  fullWidth = false,
  playlistName,
  className = "",
  onLikeChange,
  columnVisibility,
  failedPlatforms = [],
  topGenres = [],
  playlistId,
  onGenreFilter,
  isPremium = false,
}: EnhancedTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [bpmRange, setBpmRange] = React.useState<[number, number]>([0, 200]);
  const [showExplicit, setShowExplicit] = React.useState(true);
  const [showKeyMatching, setShowKeyMatching] = React.useState(false);
  const [camelotKey, setCamelotKey] = React.useState<string>("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 50;
  const { visibleColumns, toggleColumn } = useTableColumns();
  const isMobile = useMediaQuery("(max-width: 640px)");
  
  const columns = usePlaylistTableColumns({ 
    showSelection, 
    showLikeButton, 
    showAddToLibrary, 
    onLikeToggle, 
    onLikeChange, 
    onAddToLibrary, 
    userLikedTrackIds 
  });

  // Combine default visibility with passed columnVisibility prop
  const effectiveColumnVisibility = React.useMemo(() => {
    if (columnVisibility) {
      return columnVisibility;
    }
    return visibleColumns;
  }, [columnVisibility, visibleColumns]);
  
  // Filter tracks based on BPM range and explicit content
  const filteredTracks = React.useMemo(() => {
    return tracks.filter(track => {
      // BPM filter if track has BPM data
      const hasBpm = track.bpm !== undefined && track.bpm !== null;
      const bpmInRange = !hasBpm || (track.bpm >= bpmRange[0] && track.bpm <= bpmRange[1]);
      
      // Explicit content filter (simplified example, would need real metadata)
      const passesExplicitFilter = showExplicit || !track.explicit;
      
      // Key matching filter (simplified, would need proper Camelot wheel logic)
      const passesKeyFilter = !showKeyMatching || !camelotKey || 
                             track.key_signature === camelotKey;
      
      return bpmInRange && passesExplicitFilter && passesKeyFilter;
    });
  }, [tracks, bpmRange, showExplicit, showKeyMatching, camelotKey]);

  const table = useReactTable({
    data: filteredTracks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility: effectiveColumnVisibility,
      rowSelection,
      pagination: {
        pageIndex: currentPage - 1,
        pageSize,
      },
    },
  });
  
  // Show toast on initial load
  React.useEffect(() => {
    if (playlistId && tracks.length > 0) {
      toast.success(`Playlist #${playlistId} ready!`, {
        duration: 3000,
      });
    }
  }, [playlistId, tracks.length]);

  const handlePremiumFeatureClick = () => {
    toast.error("Premium feature. Please upgrade to access.", {
      description: "Upgrade your account to export or share playlists.",
      duration: 5000,
    });
  };

  const renderPlatformFailureNotices = () => {
    return (
      <>
        {failedPlatforms.includes("spotify") && (
          <div className="text-sm text-amber-500 flex items-center gap-2 mb-2">
            <span>⚠️</span> No Spotify results
          </div>
        )}
        {failedPlatforms.includes("youtube") && (
          <div className="text-sm text-amber-500 flex items-center gap-2 mb-2">
            <span>⚠️</span> No YouTube results
          </div>
        )}
      </>
    );
  };
  
  const renderTopGenres = () => {
    if (!topGenres || topGenres.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {topGenres.slice(0, 3).map((genre) => (
          <Badge 
            key={genre} 
            variant="outline" 
            className="cursor-pointer hover:bg-primary/10 transition-colors"
            onClick={() => onGenreFilter?.(genre)}
          >
            {genre}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <div className={`w-full space-y-4 ${className} animate-fade-in`}>
      <PlaylistTableControls 
        table={table} 
        showControls={showControls} 
        columns={columns}
        onToggleColumn={toggleColumn}
      />
      
      {/* Top genres and platform failure notices */}
      <div className="px-4">
        {renderTopGenres()}
        {renderPlatformFailureNotices()}
      </div>
      
      {/* Filtering controls */}
      {showControls && (
        <div className="px-4 py-2 bg-muted/20 rounded-md space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">BPM Range: {bpmRange[0]} - {bpmRange[1]}</div>
              <Slider 
                defaultValue={bpmRange} 
                min={0} 
                max={200} 
                step={1} 
                onValueChange={(value) => setBpmRange(value as [number, number])} 
              />
            </div>
            
            <div className="space-y-2 flex items-center gap-2">
              <div className="space-x-2 flex items-center">
                <Switch 
                  id="explicit-content" 
                  checked={showExplicit} 
                  onCheckedChange={setShowExplicit} 
                />
                <label htmlFor="explicit-content" className="text-sm font-medium cursor-pointer">
                  Show Explicit
                </label>
              </div>
              
              <div className="space-x-2 flex items-center ml-4">
                <Switch 
                  id="key-matching" 
                  checked={showKeyMatching} 
                  onCheckedChange={setShowKeyMatching} 
                />
                <label htmlFor="key-matching" className="text-sm font-medium cursor-pointer">
                  Key Matching
                </label>
              </div>
            </div>
            
            {showKeyMatching && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Camelot Key:</label>
                <select 
                  className="w-full bg-background border border-input rounded-md px-3 py-2"
                  value={camelotKey}
                  onChange={(e) => setCamelotKey(e.target.value)}
                >
                  <option value="">Select key...</option>
                  <option value="1A">1A (Ab Minor)</option>
                  <option value="2A">2A (Eb Minor)</option>
                  <option value="3A">3A (Bb Minor)</option>
                  <option value="4A">4A (F Minor)</option>
                  <option value="5A">5A (C Minor)</option>
                  <option value="6A">6A (G Minor)</option>
                  <option value="7A">7A (D Minor)</option>
                  <option value="8A">8A (A Minor)</option>
                  <option value="9A">9A (E Minor)</option>
                  <option value="10A">10A (B Minor)</option>
                  <option value="11A">11A (F# Minor)</option>
                  <option value="12A">12A (C# Minor)</option>
                  <option value="1B">1B (B Major)</option>
                  <option value="2B">2B (F# Major)</option>
                  <option value="3B">3B (Db Major)</option>
                  <option value="4B">4B (Ab Major)</option>
                  <option value="5B">5B (Eb Major)</option>
                  <option value="6B">6B (Bb Major)</option>
                  <option value="7B">7B (F Major)</option>
                  <option value="8B">8B (C Major)</option>
                  <option value="9B">9B (G Major)</option>
                  <option value="10B">10B (D Major)</option>
                  <option value="11B">11B (A Major)</option>
                  <option value="12B">12B (E Major)</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="overflow-hidden rounded-lg border border-muted">
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={`text-xs font-medium text-muted-foreground ${
                        header.column.getCanSort() ? "cursor-pointer select-none" : ""
                      }`}
                      onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      
                      {header.column.getCanSort() && (
                        <span className="ml-1">
                          {{
                            asc: " ↑",
                            desc: " ↓",
                          }[header.column.getIsSorted() as string] ?? " ⇅"}
                        </span>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={`hover:bg-muted/50 transition-colors ${
                      index % 2 === 0 ? "bg-background" : "bg-muted/20"
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell 
                        key={cell.id} 
                        className="transition-all duration-300 ease-in-out"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Play 30s Preview"
                          aria-label="Play 30s preview"
                        >
                          <Play size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <EmptyTableState colSpan={columns.length} />
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Pagination */}
      <TablePagination 
        table={table} 
        showControls={filteredTracks.length > pageSize} 
      />
      
      {/* Premium export/share buttons */}
      <div className="flex flex-wrap justify-end gap-2 mt-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePremiumFeatureClick}
                disabled={!isPremium}
              >
                <Copy size={16} className="mr-1" /> Copy to Clipboard
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Upgrade to Premium to use this feature</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePremiumFeatureClick}
                disabled={!isPremium}
              >
                <Download size={16} className="mr-1" /> Download CSV
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Upgrade to Premium to use this feature</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePremiumFeatureClick}
                disabled={!isPremium}
              >
                <Share size={16} className="mr-1" /> Share Public Link
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Upgrade to Premium to use this feature</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

export default GeneratedPlaylistTable;
