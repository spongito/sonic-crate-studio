
import { Button } from "@/components/ui/button";
import { Sliders } from "lucide-react";

interface AdvancedButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export const AdvancedButton = ({ onClick, disabled }: AdvancedButtonProps) => {
  return (
    <Button
      variant="outline"
      className="border-white/10 hover:bg-white/5 px-5 py-2 md:px-6 md:py-2"
      onClick={onClick}
      disabled={disabled}
    >
      <Sliders className="h-5 w-5" />
    </Button>
  );
};
