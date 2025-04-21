
import { Button } from "@/components/ui/button";
import { CollapsibleContent } from "@/components/ui/collapsible";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DebugLogsSectionProps {
  spotifyApiQuery: string;
  youtubeApiQuery: string;
  debugLogs: string[];
}

export function DebugLogsSection({
  spotifyApiQuery,
  youtubeApiQuery,
  debugLogs,
}: DebugLogsSectionProps) {
  const { toast } = useToast();

  const handleCopyToClipboard = (text: string, description: string = "Text") => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${description} copied to clipboard`,
      duration: 2000,
    });
  };

  return (
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
  );
}
