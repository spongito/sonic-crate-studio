
import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import TrackCell from "@/components/TrackCell";
import PlatformCell from "@/components/PlatformCell";
import TrackLikeButton from "@/components/TrackLikeButton";
import type { Track } from "@/types/table";

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
          } as ColumnDef<Track>,
        ]
      : []),
    {
      accessorKey: "title",
      header: "Track",
      cell: ({ row }) => (
        <TrackCell track={row.original} />
      ),
      enableHiding: false,
    },
    {
      accessorKey: "album",
      header: "Album",
      cell: ({ row }) => <span className="text-sm">{row.getValue("album")}</span>,
    },
    {
      accessorKey: "platform",
      header: "Platform",
      cell: ({ row }) => <PlatformCell track={row.original} />,
    },
    {
      accessorKey: "bpm",
      header: "BPM",
      cell: ({ row }) => <span className="text-sm">{row.getValue("bpm")}</span>,
    },
    {
      accessorKey: "key_signature",
      header: "Key",
      cell: ({ row }) => {
        const keyValue = row.original.key_signature || row.original.key;
        return <span className="text-sm">{keyValue}</span>;
      },
    },
    {
      accessorKey: "genre",
      header: "Genre",
      cell: ({ row }) => {
        const genre = row.original.genre;
        const genreText = Array.isArray(genre)
          ? genre.join(", ")
          : typeof genre === "string"
          ? genre
          : "";
        return <span className="text-sm">{genreText}</span>;
      },
    },
    {
      accessorKey: "release_year",
      header: "Year",
      cell: ({ row }) => {
        const year = row.original.release_year || row.original.year;
        return <span className="text-sm">{year}</span>;
      },
    },
    {
      accessorKey: "duration",
      header: "Duration",
      cell: ({ row }) => <span className="text-sm">{row.getValue("duration")}</span>,
    },
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
          } as ColumnDef<Track>,
        ]
      : []),
  ];

  return columns;
}
