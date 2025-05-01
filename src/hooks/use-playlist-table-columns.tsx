
import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import TrackCell from "@/components/TrackCell";
import PlatformCell from "@/components/PlatformCell";
import TrackLikeButton from "@/components/TrackLikeButton";
import type { Track } from "@/types/table";

interface UsePlaylistTableColumnsProps {
  showLikeButton?: boolean;
  onLikeToggle?: (trackId: string) => void;
  onLikeChange?: (trackId: string, liked: boolean) => void;
  userLikedTrackIds?: string[];
}

export function usePlaylistTableColumns({
  showLikeButton = true,
  onLikeToggle,
  onLikeChange,
  userLikedTrackIds = [],
}: UsePlaylistTableColumnsProps): ColumnDef<Track>[] {
  // Handle like toggle from TrackLikeButton
  const handleLikeToggle = React.useCallback((trackId: string, liked: boolean) => {
    // Pass the new liked state and track ID to the parent component
    if (onLikeChange) {
      onLikeChange(trackId, liked);
    } else if (onLikeToggle) {
      // For backward compatibility
      onLikeToggle(trackId);
    }
  }, [onLikeChange, onLikeToggle]);

  const columns: ColumnDef<Track>[] = [
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
    ...(showLikeButton
      ? [
          {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
              // Determine if the track is liked based on either the track's liked property
              // or its presence in the userLikedTrackIds array
              const isLiked = row.original.liked || userLikedTrackIds.includes(row.original.id);
              
              return (
                <TrackLikeButton
                  trackId={row.original.id}
                  liked={isLiked}
                  onToggle={handleLikeToggle}
                />
              );
            },
          } as ColumnDef<Track>,
        ]
      : []),
  ];

  return columns;
}
