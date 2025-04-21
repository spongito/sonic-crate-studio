
import React from "react";
import TrackCell from "./TrackCell";
import TrackLikeButton from "./TrackLikeButton";
import { Track } from "./GeneratedPlaylistTable";
import { formatDuration } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

interface PlaylistTableColumnParams {
  showSelection?: boolean;
  showLikeButton?: boolean;
  showAddToLibrary?: boolean;
  onLikeToggle: (trackId: string) => void;
  onAddToLibrary?: (trackId: string) => void;
  userLikedTrackIds?: string[];
  onLikeChange?: (trackId: string, liked: boolean) => void;
}

export function getPlaylistTableColumns({
  showSelection = true,
  showLikeButton = true,
  showAddToLibrary = false,
  onLikeToggle,
  onAddToLibrary,
  userLikedTrackIds = [],
  onLikeChange,
}: PlaylistTableColumnParams) {
  const columns = [
    // Selection column (optional)
    ...(showSelection
      ? [
          {
            id: "select",
            header: ({ table }: any) => (
              <Checkbox
                checked={
                  table.getIsAllPageRowsSelected() ||
                  (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value: boolean) =>
                  table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
                className="translate-y-[2px]"
              />
            ),
            cell: ({ row }: any) => (
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="translate-y-[2px]"
              />
            ),
            enableSorting: false,
            enableHiding: false,
            size: 40,
          },
        ]
      : []),

    // Track info
    {
      accessorKey: "title",
      header: "Track",
      cell: ({ row }: { row: any }) => <TrackCell track={row.original as Track} />,
      enableSorting: true,
      size: 300,
    },

    // BPM
    {
      accessorKey: "bpm",
      header: "BPM",
      cell: ({ row }: { row: any }) => (
        <div className="text-sm">{row.original.bpm || "—"}</div>
      ),
      size: 80,
    },

    // Key
    {
      accessorKey: "key_signature",
      header: "Key",
      cell: ({ row }: { row: any }) => (
        <div className="text-sm">
          {row.original.key_signature || row.original.key || "—"}
        </div>
      ),
      size: 80,
    },

    // Year
    {
      accessorKey: "release_year",
      header: "Year",
      cell: ({ row }: { row: any }) => (
        <div className="text-sm">
          {row.original.release_year || row.original.year || "—"}
        </div>
      ),
      size: 80,
    },

    // Duration
    {
      accessorKey: "duration",
      header: "Time",
      cell: ({ row }: { row: any }) => {
        const duration = row.original.duration;
        return (
          <div className="text-sm">
            {typeof duration === "number"
              ? formatDuration(duration)
              : duration || "—"}
          </div>
        );
      },
      size: 80,
    },

    // Platform
    {
      accessorKey: "platform",
      header: "Platform",
      cell: ({ row }: { row: any }) => {
        const platform = row.original.platform;
        return (
          <div className="text-sm">
            {Array.isArray(platform)
              ? platform.join(", ")
              : platform || "—"}
          </div>
        );
      },
      size: 100,
    },

    // Like button (optional)
    ...(showLikeButton
      ? [
          {
            id: "actions",
            cell: ({ row }: { row: any }) => {
              const track = row.original as Track;
              const isLiked = track.liked || userLikedTrackIds.includes(track.id);
              
              return (
                <div className="flex justify-end">
                  <TrackLikeButton
                    trackId={track.id}
                    liked={isLiked}
                    onToggle={onLikeToggle}
                    onAddToLibrary={onAddToLibrary}
                    showAddToLibrary={showAddToLibrary}
                  />
                </div>
              );
            },
            size: 80,
          },
        ]
      : []),
  ];

  return columns;
}
