
export type Track = {
  id: string;
  title: string;
  artist: string | string[];
  album: string;
  bpm: number | null;
  key_signature?: string;
  key?: string;
  genre: string | string[] | null;
  year?: number;
  release_year?: number;
  duration: string | number;
  albumArt?: string;
  image_url?: string;
  platform: string | string[];
  liked?: boolean;
  platform_url?: string;
  spotify_id?: string;
  created_at?: string; // Add this to fix the type error
  duration_seconds?: number; // Add this to support duration calculation
  explicit?: boolean; // Whether the track has explicit content
  social_metric?: number; // A social engagement metric (e.g., TikTok shares)
  energy?: number; // Track energy level (0-1)
  danceability?: number; // Track danceability (0-1)
  camelot_key?: string; // The track's Camelot key notation
};

export type GeneratedTrack = Track;

export interface TableProps {
  tracks: Track[];
  showSelection?: boolean;
  showLikeButton?: boolean;
  showAddToLibrary?: boolean;
  onLikeToggle?: (trackId: string) => void;
  onAddToLibrary?: (trackId: string) => void;
  userLikedTrackIds?: string[];
  showControls?: boolean;
  fullWidth?: boolean;
  playlistName?: string;
  className?: string;
  onLikeChange?: (trackId: string, liked: boolean) => void;
  columnVisibility?: Record<string, boolean>;
}
