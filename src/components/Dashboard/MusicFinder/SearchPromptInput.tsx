
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";

interface SearchPromptInputProps {
  prompt: string;
  isGenerating: boolean;
  disabled: boolean;
  onChange: (value: string) => void;
  onGenerate: () => void;
}

export function SearchPromptInput({
  prompt,
  isGenerating,
  disabled,
  onChange,
  onGenerate
}: SearchPromptInputProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <SearchInput
        placeholder="curate a soulful afrobeat set for golden hour"
        className="flex-1 bg-white/5 border-white/10 focus:border-gold/30 focus:ring-gold/20"
        value={prompt}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onGenerate()}
        disabled={isGenerating}
      />
      <Button 
        className="neo-gold-button"
        onClick={onGenerate}
        disabled={disabled || isGenerating}
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
  );
}
