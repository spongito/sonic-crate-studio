
export interface Track {
  title: string;
  artist: string | string[];
  album?: string;
  spotify_id?: string;
  youtube_id?: string;
  id?: string; // Add this to fix compatibility issues
  duration?: string;
  match_score?: number;
  audio_features?: {
    bpm?: number;
    key?: number;
    mode?: number;
  };
  platform?: string;
  platform_url?: string;
  external_url?: string; // Add this to fix compatibility issues
  cover_url?: string;
  release_year?: number;
  genre?: string | string[];
  audio_confidence_score?: number;
  key_signature?: string; // Add this to fix compatibility issues
}

export interface Playlist {
  id: string;
  name: string;
  prompt: string;
  created_at: string;
  results: Track[];
  description?: string;
  user_id: string;
  is_public: boolean;
  updated_at: string;
  genres: string[];
  settings?: any;
  tags?: string[];
  cover_image_url?: string; // Add this to fix compatibility issues
}
