
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sliders, ArrowRight, Loader2 } from "lucide-react";

interface PromptBarProps {
  prompt: string;
  setPrompt: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  disabled?: boolean;
  onAdvanced?: () => void;
}

export default function PromptBar({
  prompt,
  setPrompt,
  onGenerate,
  isGenerating,
  disabled = false,
  onAdvanced,
}: PromptBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      <Input
        placeholder="curate a soulful afrobeat set for golden hour"
        className="flex-1 bg-white/5 border-white/10 focus:border-gold/30 focus:ring-gold/20"
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        onKeyDown={e => e.key === "Enter" && onGenerate()}
        disabled={isGenerating || disabled}
        autoFocus
      />
      <div className="flex gap-2">
        {onAdvanced &&
          <Button
            type="button"
            variant="outline"
            className="border-white/10 hover:bg-white/5"
            onClick={onAdvanced}
            disabled={isGenerating || disabled}
            aria-label="Advanced Filters"
          >
            <Sliders className="h-4 w-4" />
          </Button>
        }
        <Button
          className="neo-gold-button"
          type="button"
          disabled={isGenerating || disabled}
          onClick={onGenerate}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              Find Songs
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
