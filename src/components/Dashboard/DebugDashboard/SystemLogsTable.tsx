import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchQuery {
  id: string;
  user_id: string | null;
  query_text: string | null;
  genre: string | null;
  platforms: string[];
  timestamp: string;
  reference_artists: string[];
  // minimal fields needed
}

export function SystemLogsTable() {
  const [queries, setQueries] = useState<SearchQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

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

  const formatTimestamp = (timestamp: string) => new Date(timestamp).toLocaleString();

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
            <TableHead>Spotify API Query</TableHead>
            <TableHead>YouTube API Query</TableHead>
            <TableHead>Platforms</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {queries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">No logs found</TableCell>
            </TableRow>
          ) : (
            queries.map(q => (
              <TableRow key={q.id}>
                <TableCell className="font-mono text-xs">{formatTimestamp(q.timestamp)}</TableCell>
                <TableCell className="max-w-[320px] truncate" title={q.query_text || ""}>{q.query_text}</TableCell>
                <TableCell className="font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="truncate max-w-[280px]" title={buildSpotifyApiQuery(q)}>{buildSpotifyApiQuery(q)}</span>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => handleCopy(q.id + "_spotify", buildSpotifyApiQuery(q))}
                    >
                      {copied === q.id + "_spotify" ? (
                        <span className="text-green-600 font-medium text-xs">Copied!</span>
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="truncate max-w-[280px]" title={buildYouTubeApiQuery(q)}>{buildYouTubeApiQuery(q)}</span>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => handleCopy(q.id + "_yt", buildYouTubeApiQuery(q))}
                    >
                      {copied === q.id + "_yt" ? (
                        <span className="text-green-600 font-medium text-xs">Copied!</span>
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
                <TableCell>{q.platforms?.join(", ") || "N/A"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
