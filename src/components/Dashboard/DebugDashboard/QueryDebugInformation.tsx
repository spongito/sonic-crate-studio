
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SearchQuery } from "./types";

interface QueryDebugInformationProps {
  query: SearchQuery;
  spotifyApiQuery: string;
  youtubeApiQuery: string;
  debugLogs?: string[];
}

export function QueryDebugInformation({
  query,
  spotifyApiQuery,
  youtubeApiQuery,
  debugLogs = [],
}: QueryDebugInformationProps) {
  const { toast } = useToast();

  const handleCopyAll = () => {
    const infoText = [
      `Search Query: ${query.query_text || ""}`,
      `Platforms: ${query.platforms?.join(", ") || ""}`,
      query.genre ? `Genre: ${query.genre}` : undefined,
      query.reference_artists?.length ? `Reference Artists: ${query.reference_artists.join(", ")}` : undefined,
      query.reference_tracks?.length ? `Reference Tracks: ${query.reference_tracks.join(", ")}` : undefined,
      query.release_year_min && query.release_year_max ? `Year: ${query.release_year_min} - ${query.release_year_max}` : undefined,
      query.commercial_factor !== undefined && query.commercial_factor !== null ? `Commercial: ${query.commercial_factor}/100` : undefined,
      query.location?.length ? `Location: ${query.location.join(", ")}` : undefined,
      query.bpm_min && query.bpm_max ? `BPM: ${query.bpm_min} - ${query.bpm_max}` : undefined,
      query.length_minutes ? `Length: ${query.length_minutes} minutes` : undefined,
      "",
      `Spotify Query:\n${spotifyApiQuery || "N/A"}`,
      "",
      `YouTube Query:\n${youtubeApiQuery || "N/A"}`,
      "",
      debugLogs.length > 0 ? `Debug Logs:\n${debugLogs.join('\n')}` : undefined,
    ]
      .filter(Boolean)
      .join('\n');
    navigator.clipboard.writeText(infoText);
    toast({
      title: "Copied!",
      description: "Query debug information copied to clipboard.",
      duration: 1800,
    });
  };

  return (
    <div className="glass-morphism rounded-xl p-4 space-y-3">
      <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-2 mb-1">
        <div>
          <h4 className="text-sm font-semibold">Debug Information</h4>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2"
          onClick={handleCopyAll}
        >
          <Copy className="h-4 w-4 mr-1" />
          Copy All
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="glass-morphism rounded-lg p-3">
          <div className="text-xs text-white/70 font-medium mb-1">Search Query</div>
          <div className="text-xs font-mono break-words">{query.query_text}</div>
        </div>
        <div className="glass-morphism rounded-lg p-3">
          <div className="text-xs text-white/70 font-medium mb-1">Platforms</div>
          <div className="text-xs font-mono break-words">{query.platforms?.join(", ") || "None specified"}</div>
        </div>
      </div>
      <div className="glass-morphism rounded-lg p-3">
        <div className="text-xs text-white/70 font-medium mb-1">Filters</div>
        <div className="grid grid-cols-2 gap-x-4 text-xs font-mono">
          <div>
            {query.genre && <div>Genre: {query.genre}</div>}
            {query.reference_artists?.length ? <div>Ref. Artists: {query.reference_artists.join(", ")}</div> : null}
            {query.reference_tracks?.length ? <div>Ref. Tracks: {query.reference_tracks.join(", ")}</div> : null}
          </div>
          <div>
            {query.release_year_min && query.release_year_max && (
              <div>Year: {query.release_year_min} - {query.release_year_max}</div>
            )}
            {typeof query.commercial_factor === "number" && (
              <div>Commercial: {query.commercial_factor}/100</div>
            )}
            {query.location?.length ? <div>Location: {query.location.join(", ")}</div> : null}
            {query.bpm_min && query.bpm_max && (
              <div>BPM: {query.bpm_min} - {query.bpm_max}</div>
            )}
            {query.length_minutes && (
              <div>Length: {query.length_minutes} minutes</div>
            )}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="glass-morphism rounded-lg p-3">
          <div className="text-xs text-white/70 font-medium mb-1">Spotify Query</div>
          <div className="text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all">
            {spotifyApiQuery || "No Spotify query"}
          </div>
        </div>
        <div className="glass-morphism rounded-lg p-3">
          <div className="text-xs text-white/70 font-medium mb-1">YouTube Query</div>
          <div className="text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all">
            {youtubeApiQuery || "No YouTube query"}
          </div>
        </div>
      </div>
      {debugLogs.length > 0 && (
        <div className="glass-morphism rounded-lg p-3">
          <div className="text-xs text-white/70 font-medium mb-1">Debug Logs</div>
          <div className="max-h-40 overflow-y-auto text-xs font-mono text-white/80 space-y-1.5">
            {debugLogs.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
