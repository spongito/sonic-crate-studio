
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface PresetsHeaderProps {
  expanded: boolean;
  onToggle: () => void;
}

export function PresetsHeader({ expanded, onToggle }: PresetsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-xl font-semibold text-gradient">
        Dial In Your Playlist
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className="text-xs flex items-center gap-1"
      >
        {expanded ? (
          <>
            Hide Options
            <ChevronUp className="h-4 w-4" />
          </>
        ) : (
          <>
            Show All Options
            <ChevronDown className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}
