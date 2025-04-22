
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";

interface GenerateButtonProps {
  onClick: () => void;
  disabled: boolean;
  isGenerating: boolean;
  user: any;
}

export const GenerateButton = ({ onClick, disabled, isGenerating, user }: GenerateButtonProps) => {
  return (
    <Button 
      className="bg-gold hover:bg-gold-dark text-black font-semibold px-5 py-2 md:px-6 md:py-2"
      onClick={onClick}
      disabled={disabled}
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          Find Songs
          {user && <ArrowRight className="ml-2 h-5 w-5" />}
        </>
      )}
    </Button>
  );
};
