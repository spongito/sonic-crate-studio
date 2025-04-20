
export interface Track {
  title: string;
  artist: string;
  album?: string;
  spotify_id?: string;
  youtube_id?: string;
  duration?: string;
  match_score?: number;
  audio_features?: {
    bpm?: number;
    key?: number;
    mode?: number;
  };
  platform?: string;
  platform_url?: string;
  cover_url?: string;
  release_year?: number;
  genre?: string[];
  audio_confidence_score?: number;
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
}
