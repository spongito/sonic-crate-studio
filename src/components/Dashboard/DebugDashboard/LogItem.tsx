import { Button } from "@/components/ui/button";
import { Bug } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { DebugLogsSection } from "./DebugLogsSection";
import { SearchQuery } from "./types";
import { buildSpotifyApiQuery, buildYouTubeApiQuery } from "./apiQueryBuilders";
import { generateDebugLogs } from "./generateDebugLogs";
import { QueryDebugInformation } from "./QueryDebugInformation";

interface LogItemProps {
  query: SearchQuery;
}

export function LogItem({ query }: LogItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const spotifyApiQuery = buildSpotifyApiQuery(query);
  const youtubeApiQuery = buildYouTubeApiQuery(query);
  const debugLogs = generateDebugLogs(query);

  const formatTimestamp = (timestamp: string) => {
    const d = new Date(timestamp);
    return (
      d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
      " " +
      d.toLocaleDateString()
    );
  };

  return (
    <div className="glass-morphism rounded-xl p-4">
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
            onClick={() => setIsOpen((v) => !v)}
          >
            <Bug className="h-4 w-4" />
            {isOpen ? "Hide" : "Show"} Debug Logs
          </Button>
        </div>
      </div>

      <Collapsible open={isOpen} onOpenChange={() => setIsOpen((v) => !v)}>
        <CollapsibleContent>
          <div className="py-2">
            <QueryDebugInformation
              query={query}
              spotifyApiQuery={spotifyApiQuery}
              youtubeApiQuery={youtubeApiQuery}
              debugLogs={debugLogs}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
