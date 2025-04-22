
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
  created_at?: string; 
  duration_seconds?: number;
  explicit?: boolean;
  social_metric?: number;
  energy?: number;
  danceability?: number; 
  camelot_key?: string;
  score?: number; // Track score for sorting
  source?: string; // Source platform (spotify, youtube_audio)
  audio_features?: {
    bpm?: number;
    tempo?: number;
    key?: number;
    mode?: number;
    key_signature?: string;
    time_signature?: number;
    energy?: number;
    valence?: number;
    danceability?: number;
    acousticness?: number;
    instrumentalness?: number;
    speechiness?: number;
  };
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
  failedPlatforms?: string[]; // Add failed platforms property
}
