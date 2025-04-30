
import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import TrackCell from "@/components/TrackCell";
import PlatformCell from "@/components/PlatformCell";
import TrackLikeButton from "@/components/TrackLikeButton";
import type { Track } from "@/types/table";
import { ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UsePlaylistTableColumnsProps {
  showSelection?: boolean;
  showLikeButton?: boolean;
  showAddToLibrary?: boolean;
  onLikeToggle?: (trackId: string) => void;
  onLikeChange?: (trackId: string, liked: boolean) => void;
  onAddToLibrary?: (trackId: string) => void;
  userLikedTrackIds?: string[];
}

export function usePlaylistTableColumns({
  showSelection = true,
  showLikeButton = true,
  showAddToLibrary = false,
  onLikeToggle,
  onLikeChange,
  onAddToLibrary,
  userLikedTrackIds = [],
}: UsePlaylistTableColumnsProps): ColumnDef<Track>[] {
  // Handle like toggle
  const handleLikeToggle = (trackId: string) => {
    const isCurrentlyLiked = userLikedTrackIds.includes(trackId);
    if (onLikeToggle) onLikeToggle(trackId);
    if (onLikeChange) onLikeChange(trackId, !isCurrentlyLiked);
  };

  const columns: ColumnDef<Track>[] = [
    ...(showSelection
      ? [
          {
            id: "select",
            header: ({ table }) => (
              <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
                className="translate-y-[2px]"
              />
            ),
            cell: ({ row }) => (
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="translate-y-[2px]"
              />
            ),
            enableHiding: false,
            enableSorting: false,
          } as ColumnDef<Track>,
        ]
      : []),
    {
      accessorKey: "title",
      header: ({ column }) => (
        <div className="flex items-center cursor-pointer" onClick={() => column.toggleSorting()}>
          Track
          <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
        </div>
      ),
      cell: ({ row }) => (
        <TrackCell track={row.original} />
      ),
      enableHiding: false,
      enableSorting: true,
    },
    {
      accessorKey: "album",
      header: "Album",
      cell: ({ row }) => <span className="text-sm">{row.getValue("album")}</span>,
      enableSorting: true,
    },
    {
      accessorKey: "platform",
      header: "Platform",
      cell: ({ row }) => <PlatformCell track={row.original} />,
      enableSorting: true,
    },
    {
      accessorKey: "bpm",
      header: ({ column }) => (
        <div className="flex items-center cursor-pointer" onClick={() => column.toggleSorting()}>
          BPM
          <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
        </div>
      ),
      cell: ({ row }) => {
        const bpm = row.getValue("bpm");
        return bpm ? <span className="text-sm">{bpm}</span> : <span className="text-muted-foreground text-sm">N/A</span>;
      },
      enableSorting: true,
    },
    {
      accessorKey: "key_signature",
      header: "Key",
      cell: ({ row }) => {
        const keyValue = row.original.key_signature || row.original.key;
        return <span className="text-sm">{keyValue || "N/A"}</span>;
      },
      enableSorting: true,
    },
    {
      accessorKey: "genre",
      header: ({ column }) => (
        <div className="flex items-center cursor-pointer" onClick={() => column.toggleSorting()}>
          Genre
          <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
        </div>
      ),
      cell: ({ row }) => {
        const genre = row.original.genre;
        const genreText = Array.isArray(genre)
          ? genre.join(", ")
          : typeof genre === "string"
          ? genre
          : "";
        return <span className="text-sm">{genreText || "N/A"}</span>;
      },
      enableSorting: true,
    },
    {
      accessorKey: "release_year",
      header: ({ column }) => (
        <div className="flex items-center cursor-pointer" onClick={() => column.toggleSorting()}>
          Year
          <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
        </div>
      ),
      cell: ({ row }) => {
        const year = row.original.release_year || row.original.year;
        return <span className="text-sm">{year || "N/A"}</span>;
      },
      enableSorting: true,
    },
    {
      accessorKey: "duration",
      header: "Duration",
      cell: ({ row }) => <span className="text-sm">{row.getValue("duration") || "N/A"}</span>,
      enableSorting: true,
    },
    // social_metric column removed
    ...(showLikeButton || showAddToLibrary
      ? [
          {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
              <TrackLikeButton
                trackId={row.original.id}
                liked={row.original.liked ?? userLikedTrackIds.includes(row.original.id)}
                onToggle={handleLikeToggle}
                onAddToLibrary={onAddToLibrary}
                showAddToLibrary={showAddToLibrary}
              />
            ),
            enableSorting: false,
          } as ColumnDef<Track>,
        ]
      : []),
    {
      id: "preview",
      header: "Preview",
      cell: () => null, // This is handled in the main component
      enableSorting: false,
    },
  ];

  return columns;
}
