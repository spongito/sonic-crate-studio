
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sliders, Loader2 } from "lucide-react";

interface SearchFormProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  handleSubmit: () => void;
  isGenerating: boolean;
  onAdvancedClick: () => void;
  user: any;
}

export const SearchForm = ({
  prompt,
  setPrompt,
  handleSubmit,
  isGenerating,
  onAdvancedClick,
  user
}: SearchFormProps) => {
  return (
    <div className="glass-morphism p-3 sm:p-4 flex flex-col gap-4 rounded-lg">
      <Input
        placeholder="curate a soulful afrobeat set for golden hour"
        className="flex-1 bg-background/60 border-white/10 focus:border-gold/30 focus:ring-gold/20 rounded-md"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        disabled={isGenerating}
        spellCheck={false}
        autoComplete="off"
      />
      
      <div className="flex justify-center items-center mt-2">
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="border-white/10 hover:bg-white/5 px-5 py-2 md:px-6 md:py-2"
            onClick={onAdvancedClick}
            disabled={isGenerating}
          >
            <Sliders className="h-5 w-5" />
          </Button>
          <Button 
            className="bg-gold hover:bg-gold-dark text-black font-semibold px-5 py-2 md:px-6 md:py-2"
            onClick={handleSubmit}
            disabled={isGenerating}
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
        </div>
      </div>
    </div>
  );
};
