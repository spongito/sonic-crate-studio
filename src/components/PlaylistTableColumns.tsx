
import { ColumnDef } from "@tanstack/react-table";
import { Track } from "./GeneratedPlaylistTable";
import TrackCell from "./TrackCell";
import TrackLikeButton from "./TrackLikeButton";

// Column definition generator for easier extensibility
export function getPlaylistTableColumns({
  showSelection,
  showLikeButton,
  showAddToLibrary,
  onLikeToggle,
  onAddToLibrary,
  userLikedTrackIds = [],
  onLikeChange,
}: {
  showSelection: boolean;
  showLikeButton: boolean;
  showAddToLibrary: boolean;
  onLikeToggle: (trackId: string) => void;
  onAddToLibrary?: (trackId: string) => void;
  userLikedTrackIds?: string[];
  onLikeChange?: (trackId: string, liked: boolean) => void;
}): ColumnDef<Track>[] {
  const handleLikeToggle = (trackId: string, liked?: boolean) => {
    if (onLikeToggle) onLikeToggle(trackId);
    if (onLikeChange) onLikeChange(trackId, !liked);
  };

  return [
    ...(showSelection
      ? [
          {
            id: "select",
            header: ({ table }) => (
              <span>
                <input
                  type="checkbox"
                  checked={
                    table.getIsAllPageRowsSelected()
                      ? true
                      : table.getIsSomePageRowsSelected()
                  }
                  onChange={e =>
                    table.toggleAllPageRowsSelected(e.target.checked)
                  }
                  aria-label="Select all"
                  className="translate-y-[2px]"
                />
              </span>
            ),
            cell: ({ row }) => (
              <input
                type="checkbox"
                checked={row.getIsSelected()}
                onChange={e => row.toggleSelected(e.target.checked)}
                aria-label="Select row"
                className="translate-y-[2px]"
              />
            ),
            enableSorting: false,
            enableHiding: false,
          } as ColumnDef<Track>,
        ]
      : []),
    {
      accessorKey: "title",
      header: "Track",
      cell: ({ row }) => <TrackCell track={row.original} />,
    },
    {
      accessorKey: "album",
      header: "Album",
      cell: ({ row }) => <span className="text-sm">{row.getValue("album")}</span>,
    },
    {
      accessorKey: "platform",
      header: "Platform",
      cell: ({ row }) => {
        const platform = row.original.platform;
        const platformText = Array.isArray(platform) ? platform.join(", ") : platform;
        return <div className="text-sm">{platformText}</div>;
      },
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
                onToggle={() => handleLikeToggle(row.original.id, row.original.liked)}
                onAddToLibrary={onAddToLibrary}
                showAddToLibrary={showAddToLibrary}
              />
            ),
          } as ColumnDef<Track>,
        ]
      : []),
  ];
}
