
import { Button } from "@/components/ui/button";
import { Bug } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface DebugPanelProps {
  showDebug: boolean;
  onToggleDebug: (value: boolean) => void;
  debugLogs: string[];
}

export function DebugPanel({ showDebug, onToggleDebug, debugLogs }: DebugPanelProps) {
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
        <div className="bg-black/50 rounded-lg p-4 max-h-64 overflow-y-auto text-xs font-mono">
          {debugLogs.length === 0 ? (
            <p className="text-gray-400">No logs yet. Generate a playlist to see debug information.</p>
          ) : (
            <div className="space-y-1">
              {debugLogs.map((log, index) => (
                <p key={index} className="text-gray-300">{log}</p>
              ))}
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
