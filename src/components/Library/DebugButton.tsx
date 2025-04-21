
import { Bug } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DebugButtonProps {
  showDebug: boolean;
  onToggle: () => void;
}

export function DebugButton({ showDebug, onToggle }: DebugButtonProps) {
  return (
    <div className="flex justify-end">
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-2"
        onClick={onToggle}
      >
        <Bug size={16} />
        {showDebug ? 'Hide Debug' : 'Show Debug'}
      </Button>
    </div>
  );
}
