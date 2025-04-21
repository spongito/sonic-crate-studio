
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
  // Add any extra keys fetched (maybe in future)
}
