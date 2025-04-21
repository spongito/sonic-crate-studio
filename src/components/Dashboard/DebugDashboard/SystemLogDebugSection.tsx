
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SearchQuery } from "./types";
import { buildSpotifyApiQuery, buildYouTubeApiQuery } from "./apiQueryBuilders";
import { generateDebugLogs } from "./generateDebugLogs";

interface SystemLogDebugSectionProps {
  query: SearchQuery;
}

export function SystemLogDebugSection({ query }: SystemLogDebugSectionProps) {
  const { toast } = useToast();

  const spotifyApiQuery = buildSpotifyApiQuery(query);
  const youtubeApiQuery = buildYouTubeApiQuery(query);
  const debugLogs = generateDebugLogs(query);

  // Build single string to copy, in format shown on screenshot
  const copyAll = useCallback(() => {
    const fullLog = 
`Spotify API Query

${spotifyApiQuery}

YouTube API Query

${youtubeApiQuery}

Debug Logs

${debugLogs.join('\n')}
`;
    navigator.clipboard.writeText(fullLog);
    toast({
      title: "Copied!",
      description: "All debug log details copied to clipboard.",
      duration: 2000,
    });
  }, [spotifyApiQuery, youtubeApiQuery, debugLogs, toast]);

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <div className="text-base font-semibold text-white/80">Debug Logs</div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2"
          onClick={copyAll}
        >
          <Copy className="h-4 w-4"/>
          <span className="sr-only">Copy full log</span>
        </Button>
      </div>
      <div>
        <div className="text-xs font-semibold text-white/60 mb-0.5">Spotify API Query</div>
        <div className="bg-black/50 p-2 rounded text-xs font-mono overflow-x-auto mb-2">
          {spotifyApiQuery}
        </div>
        <div className="text-xs font-semibold text-white/60 mb-0.5">YouTube API Query</div>
        <div className="bg-black/50 p-2 rounded text-xs font-mono overflow-x-auto mb-2">
          {youtubeApiQuery}
        </div>
        <div className="text-xs font-semibold text-white/60 mb-0.5 mt-2">Debug Logs</div>
        <div className="bg-black/50 p-3 rounded max-h-80 overflow-y-auto font-mono text-xs space-y-1.5 text-white/80">
          {debugLogs.map((log, idx) => (<div key={idx}>{log}</div>))}
        </div>
      </div>
    </div>
  );
}
