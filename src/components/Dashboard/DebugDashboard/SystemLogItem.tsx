
import { useState } from "react";
import { Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SearchQuery } from "./types";
import { SystemLogDebugSection } from "./SystemLogDebugSection";

interface SystemLogItemProps {
  query: SearchQuery;
}

export function SystemLogItem({ query }: SystemLogItemProps) {
  const [isOpen, setIsOpen] = useState(false);

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
            {isOpen ? "Hide Debug Logs" : "Show Debug Logs"}
          </Button>
        </div>
      </div>
      <Collapsible open={isOpen} onOpenChange={() => setIsOpen((v) => !v)}>
        <CollapsibleContent>
          <SystemLogDebugSection query={query} />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
