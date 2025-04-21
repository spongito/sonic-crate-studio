
import { Button } from "@/components/ui/button";
import { Bug } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useMemo } from "react";
import { QueryDebugInformation } from "@/components/Dashboard/DebugDashboard/QueryDebugInformation";
import { buildSpotifyApiQuery, buildYouTubeApiQuery } from "@/components/Dashboard/DebugDashboard/apiQueryBuilders";

interface DebugPanelProps {
  showDebug: boolean;
  onToggleDebug: (value: boolean) => void;
  debugLogs: string[];
  // Optionally pass full query context if available for richer debug
  debugQueryContext?: any;
}

export function DebugPanel({ showDebug, onToggleDebug, debugLogs, debugQueryContext }: DebugPanelProps) {
  // Try to infer a "query"-like object from debugLogs if debugQueryContext is not provided
  const fallbackQueryObj = useMemo(() => {
    const findPrompt = debugLogs.find(line => line.includes('Starting generation with prompt:'));
    const promptMatch = findPrompt?.match(/"(.+?)"/);
    const query_text = promptMatch ? promptMatch[1] : "";
    return {
      query_text,
      platforms: debugLogs.find(line => line.toLowerCase().includes('enabled platforms:'))
        ?.split(":")[1]
        ?.split(",")
        .map(s => s.trim())
        .filter(Boolean) || [],
      // You may expand this to extract more info if really needed
    };
  }, [debugLogs]);

  const query = debugQueryContext || fallbackQueryObj;

  return (
    <Collapsible 
      open={showDebug} 
      onOpenChange={onToggleDebug}
      className="mt-8 glass-morphism p-2 rounded-xl border border-white/10"
    >
      <div className="flex items-center justify-between px-4">
        <h3 className="text-sm font-medium">Debug Information</h3>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            <Bug className="h-4 w-4 mr-2" />
            {showDebug ? "Hide" : "Show"} Debug Logs
          </Button>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent className="mt-2">
        {showDebug ? (
          <QueryDebugInformation
            query={query}
            spotifyApiQuery={buildSpotifyApiQuery(query)}
            youtubeApiQuery={buildYouTubeApiQuery(query)}
            debugLogs={debugLogs}
          />
        ) : null}
      </CollapsibleContent>
    </Collapsible>
  );
}
