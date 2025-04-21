
import { SearchQuery } from "./types";

/**
 * Build the Spotify API search query string for a given row.
 */
export function buildSpotifyApiQuery(row: SearchQuery) {
  let baseQuery = (row.query_text || "").trim();
  if (row.genre && row.genre !== "any" && !baseQuery.toLowerCase().includes(row.genre.toLowerCase())) {
    baseQuery += ` genre:${row.genre}`;
  }
  return `https://api.spotify.com/v1/search?q=${encodeURIComponent(baseQuery)}&type=track&limit=20`;
}

/**
 * Build the YouTube API search query string for a given row.
 */
export function buildYouTubeApiQuery(row: SearchQuery) {
  let youtubeGenre = row.genre && row.genre !== "any" ? row.genre : "";
  let youtubeArtists = row.reference_artists && row.reference_artists.length > 0 ? row.reference_artists.slice(0, 2).join(' ') : "";
  let youtubeQuery = row.query_text || "";
  if (youtubeGenre && !youtubeQuery.toLowerCase().includes(youtubeGenre.toLowerCase())) {
    youtubeQuery += ` ${youtubeGenre}`;
  }
  if (youtubeArtists && !youtubeQuery.toLowerCase().includes(youtubeArtists.toLowerCase())) {
    youtubeQuery += ` ${youtubeArtists}`;
  }
  const enhancedQuery = `${youtubeQuery} official audio OR visualizer -"music video" -"live" -"reaction" -"cover"`;
  return `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(enhancedQuery)}&maxResults=30&type=video&videoCategoryId=10&videoDuration=medium&videoEmbeddable=true`;
}
