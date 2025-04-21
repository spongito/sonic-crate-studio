import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Search, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchQuery {
  id: string;
  user_id: string | null;
  query_text: string | null;
  genre: string | null;
  platforms: string[];
  timestamp: string;
  reference_artists: string[];
  reference_tracks: string[];
  location: string[];
  bpm_min: number | null;
  bpm_max: number | null;
  release_year_min: number | null;
  release_year_max: number | null;
  commercial_factor: number | null;
  length_minutes: number | null;
}

export function SearchQueryTable() {
  const [queries, setQueries] = useState<SearchQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('search_queries')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) {
        throw new Error(error.message);
      }

      setQueries(data || []);
    } catch (err: any) {
      console.error("Error fetching search queries:", err);
      setError(err.message || "Failed to load search queries");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchQueries();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchQueries();

    const subscription = supabase
      .channel('search_queries_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'search_queries'
      }, payload => {
        setQueries(prev => [payload.new as SearchQuery, ...prev]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const filteredQueries = queries.filter(query => {
    const searchLower = searchTerm.toLowerCase();
    return (
      query.query_text?.toLowerCase().includes(searchLower) ||
      query.genre?.toLowerCase().includes(searchLower) ||
      query.platforms?.some(p => p.toLowerCase().includes(searchLower)) ||
      query.user_id?.toLowerCase().includes(searchLower)
    );
  });

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

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

  const handleCopy = (id: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 1500);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Search Query Logs</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={refreshing}
          >
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
          </Button>
        </div>
      </div>
      <div className="flex items-center relative mb-4">
        <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Filter queries..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {error ? (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md">
          Error: {error}
        </div>
      ) : loading ? (
        <div className="space-y-2">
          {Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Timestamp</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Query</TableHead>
                <TableHead>Genre</TableHead>
                <TableHead>Platforms</TableHead>
                <TableHead>BPM Range</TableHead>
                <TableHead>Year Range</TableHead>
                <TableHead>Commercial Factor</TableHead>
                <TableHead className="min-w-[320px]">Spotify API Query String</TableHead>
                <TableHead className="min-w-[320px]">YouTube Search Query</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQueries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center">
                    No search queries found
                  </TableCell>
                </TableRow>
              ) : (
                filteredQueries.map((query) => {
                  const apiQuery = buildSpotifyApiQuery(query);
                  const ytQuery = buildYouTubeApiQuery(query);

                  return (
                    <TableRow key={query.id}>
                      <TableCell className="font-mono text-xs">
                        {formatTimestamp(query.timestamp)}
                      </TableCell>
                      <TableCell className="max-w-[100px] truncate">
                        <span title={query.user_id || ""}>
                          {query.user_id ? query.user_id.substring(0, 8) + "..." : "Anonymous"}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <div className="truncate" title={query.query_text || ""}>
                          {query.query_text || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>{query.genre || "N/A"}</TableCell>
                      <TableCell>
                        {query.platforms ? query.platforms.join(", ") : "N/A"}
                      </TableCell>
                      <TableCell>
                        {query.bpm_min && query.bpm_max
                          ? `${query.bpm_min}-${query.bpm_max}`
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {query.release_year_min && query.release_year_max
                          ? `${query.release_year_min}-${query.release_year_max}`
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {query.commercial_factor !== null
                          ? `${query.commercial_factor}%`
                          : "N/A"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-mono text-xs">
                        <div className="flex items-center gap-2 max-w-[400px]">
                          <span className="truncate" title={apiQuery}>{apiQuery}</span>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => handleCopy(query.id + "_spotify", apiQuery)}
                          >
                            {copiedId === query.id + "_spotify" ? (
                              <span className="text-green-600 font-medium text-xs">Copied!</span>
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-mono text-xs">
                        <div className="flex items-center gap-2 max-w-[400px]">
                          <span className="truncate" title={ytQuery}>{ytQuery}</span>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => handleCopy(query.id + "_yt", ytQuery)}
                          >
                            {copiedId === query.id + "_yt" ? (
                              <span className="text-green-600 font-medium text-xs">Copied!</span>
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}
      {!loading && filteredQueries.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Showing {filteredQueries.length} of {queries.length} queries
        </p>
      )}
    </div>
  );
}
