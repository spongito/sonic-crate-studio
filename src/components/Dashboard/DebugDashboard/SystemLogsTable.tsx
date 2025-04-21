
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface SearchQuery {
  id: string;
  user_id: string | null;
  query_text: string | null;
  genre: string | null;
  platforms: string[];
  timestamp: string;
  reference_artists: string[];
  // Add any extra keys fetched (maybe in future)
}

export function SystemLogsTable() {
  const [queries, setQueries] = useState<SearchQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  // For expanding/collapsing debug per row
  const [openLog, setOpenLog] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('search_queries')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);
      if (!error) setQueries(data || []);
      setLoading(false);
    })();
  }, []);

  const buildSpotifyApiQuery = (row: SearchQuery) => {
    let baseQuery = (row.query_text || "").trim();
    if (row.genre && row.genre !== "any" && !baseQuery.toLowerCase().includes(row.genre.toLowerCase())) {
      baseQuery += ` genre:${row.genre}`;
    }
    return `https://api.spotify.com/v1/search?q=${encodeURIComponent(baseQuery)}&type=track&limit=20`;
  };

  // Always build the exact full YouTube API search string
  const buildYouTubeApiQuery = (row: SearchQuery) => {
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
  };

  const formatTimestamp = (timestamp: string) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + " " + d.toLocaleDateString();
  };

  // Simulated step-by-step debug logs for demo (TODO: fetch from backend if available)
  const generateDebugLogs = (row: SearchQuery) => {
    // These log lines imitate the stepwise logs shown on the image screenshot.
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
  };

  const handleCopy = (id: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(id);
    setTimeout(() => setCopied(null), 1300);
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {Array(5).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Prompt</TableHead>
            <TableHead>Platforms</TableHead>
            <TableHead className="min-w-[340px]">Spotify API Query</TableHead>
            <TableHead className="min-w-[360px]">YouTube Search Query</TableHead>
            <TableHead>Debug Logs</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {queries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">No logs found</TableCell>
            </TableRow>
          ) : (
            queries.map(q => {
              const spotifyQ = buildSpotifyApiQuery(q);
              const youtubeQ = buildYouTubeApiQuery(q);
              const debugLogs = generateDebugLogs(q);
              return (
                <TableRow key={q.id}>
                  <TableCell className="font-mono text-xs whitespace-nowrap">{formatTimestamp(q.timestamp)}</TableCell>
                  <TableCell className="max-w-[260px] truncate" title={q.query_text || ""}>{q.query_text}</TableCell>
                  <TableCell>{q.platforms?.join(", ") || "N/A"}</TableCell>
                  <TableCell className="font-mono text-xs">
                    <div className="flex items-center gap-2 max-w-[320px]">
                      <span className="truncate" title={spotifyQ}>{spotifyQ}</span>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => handleCopy(q.id + "_spotify", spotifyQ)}
                      >
                        {copied === q.id + "_spotify" ? (
                          <span className="text-green-600 font-medium text-xs">Copied!</span>
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    <div className="flex items-center gap-2 max-w-[340px]">
                      <span className="truncate" title={youtubeQ}>{youtubeQ}</span>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => handleCopy(q.id + "_yt", youtubeQ)}
                      >
                        {copied === q.id + "_yt" ? (
                          <span className="text-green-600 font-medium text-xs">Copied!</span>
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Collapsible
                      open={openLog === q.id}
                      onOpenChange={open => setOpenLog(open ? q.id : null)}
                      className="w-[340px]"
                    >
                      <div className="flex items-center justify-between px-1">
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="px-2 py-1">
                            <Bug className="h-4 w-4 mr-1" />
                            {openLog === q.id ? "Hide" : "Show"} Debug Logs
                          </Button>
                        </CollapsibleTrigger>
                        {openLog === q.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleCopy(q.id + "_logs", debugLogs.join('\n'))}
                          >
                            {copied === q.id + "_logs" ? (
                              <span className="text-green-600 font-medium text-xs">Copied!</span>
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                      <CollapsibleContent className="mt-1">
                        <div
                          className="glass-morphism p-3 rounded-lg bg-black/50 max-h-48 overflow-y-auto font-mono text-xs space-y-1"
                          style={{ whiteSpace: "pre-line", color: "#d1d5db" }}
                        >
                          {debugLogs.map((line, i) => (
                            <div key={i}>{line}</div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
