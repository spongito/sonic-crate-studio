
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ResetButtonProps {
  onClick: () => void;
}

export function ResetButton({ onClick }: ResetButtonProps) {
  return (
    <Button variant="outline" onClick={onClick}>
      <RefreshCw className="mr-2 h-4 w-4" />
      Reset
    </Button>
  );
}
