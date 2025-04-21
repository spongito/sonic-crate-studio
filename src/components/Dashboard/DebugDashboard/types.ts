
/**
 * Type definition for a SearchQuery used within this dashboard.
 */
export interface SearchQuery {
  id: string;
  user_id: string | null;
  query_text: string | null;
  genre: string | null;
  platforms: string[];
  timestamp: string;
  reference_artists: string[];
  reference_tracks?: string[];
  location?: string[];
  release_year_min?: number;
  release_year_max?: number;
  bpm_min?: number;
  bpm_max?: number;
  commercial_factor?: number;
  length_minutes?: number;
  // Add any extra keys fetched (maybe in future)
}
