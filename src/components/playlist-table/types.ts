
import { Track, TableProps } from "@/types/table";

export type { Track, TableProps };
export type GeneratedTrack = Track;

export interface PlaylistTableProps extends TableProps {
  columnVisibility?: Record<string, boolean>;
  showPagination?: boolean;
  userLikedTrackIds?: string[];
  onLikeChange?: (trackId: string, liked: boolean) => void;
}
