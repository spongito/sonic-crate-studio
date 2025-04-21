
import { SearchQuery } from "./types";
import { buildSpotifyApiQuery, buildYouTubeApiQuery } from "./apiQueryBuilders";

/**
 * Generate debug logs for a search query.
 * These log lines imitate the stepwise logs shown on previous screenshots.
 */
export function generateDebugLogs(row: SearchQuery) {
  const now = new Date(row.timestamp);
  const fmt = (msg: string, offsetSec: number = 0) =>
    `${new Date(now.getTime() + offsetSec * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}: ${msg}`;

  return [
    fmt(`Starting generation with prompt: "${row.query_text}"`),
    fmt(`Using advanced params: ${JSON.stringify({
      genre: row.genre || "",
      Length: "1.5h",
      commercialFactor: 50,
      releaseYearRange: [1990, 2025],
      useBpmFilter: false,
      locations: ["global"]
    })}`, 1),
    fmt(`Enabled platforms: ${row.platforms.join(", ")}`, 2),
    fmt("Calling process-music-request function...", 3),
    fmt("Detected intent: { ... }", 4),
    fmt(`Spotify API Query: ${buildSpotifyApiQuery(row)}`, 5),
    fmt(`YouTube API Query: ${buildYouTubeApiQuery(row)}`, 6),
    fmt(`Saving query to database...`, 7),
    fmt(`Playlist saved to database successfully`, 8),
    fmt(`Incremented playlist count (demo log, replace with actual backend debug logs if available)`, 9),
  ];
}
