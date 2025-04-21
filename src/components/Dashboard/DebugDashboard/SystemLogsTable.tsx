
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
import { useToast } from "@/hooks/use-toast";

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
  const [openLogs, setOpenLogs] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

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

  const handleCopyToClipboard = (text: string, description: string = "Text") => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${description} copied to clipboard`,
      duration: 2000,
    });
  };

  const toggleLogVisibility = (id: string) => {
    setOpenLogs(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
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
    <div className="space-y-4">
      {queries.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No logs found</div>
      ) : (
        <div className="space-y-4">
          {queries.map((query) => {
            const spotifyApiQuery = buildSpotifyApiQuery(query);
            const youtubeApiQuery = buildYouTubeApiQuery(query);
            const debugLogs = generateDebugLogs(query);
            const isOpen = openLogs[query.id] || false;
            
            return (
              <div key={query.id} className="glass-morphism rounded-xl p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                  <div className="flex flex-col gap-1">
                    <div className="font-mono text-xs text-white/70">{formatTimestamp(query.timestamp)}</div>
                    <div className="text-base font-medium">{query.query_text}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm px-2 py-1 bg-white/10 rounded-md">
                      {query.platforms?.join(", ") || "N/A"}
                    </div>
                    <Button
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center gap-2"
                      onClick={() => toggleLogVisibility(query.id)}
                    >
                      <Bug className="h-4 w-4" />
                      {isOpen ? "Hide" : "Show"} Debug Logs
                    </Button>
                  </div>
                </div>
                
                <Collapsible open={isOpen} onOpenChange={() => toggleLogVisibility(query.id)}>
                  <CollapsibleContent>
                    <div className="mt-4 space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-white/70">Spotify API Query</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => handleCopyToClipboard(spotifyApiQuery, "Spotify API Query")}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <div className="bg-black/50 p-2 rounded text-xs font-mono overflow-x-auto">
                          {spotifyApiQuery}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-white/70">YouTube API Query</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => handleCopyToClipboard(youtubeApiQuery, "YouTube API Query")}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <div className="bg-black/50 p-2 rounded text-xs font-mono overflow-x-auto">
                          {youtubeApiQuery}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-white/70">Debug Logs</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => handleCopyToClipboard(debugLogs.join('\n'), "Debug Logs")}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <div className="bg-black/50 p-3 rounded max-h-80 overflow-y-auto font-mono text-xs space-y-1.5 text-white/80">
                          {debugLogs.map((log, index) => (
                            <div key={index}>{log}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
