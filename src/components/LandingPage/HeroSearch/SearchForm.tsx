
import { SearchInput } from "@/components/ui/search-input";
import { AdvancedButton } from "./AdvancedButton";
import { GenerateButton } from "./GenerateButton";

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
      <SearchInput
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
          <AdvancedButton 
            onClick={onAdvancedClick}
            disabled={isGenerating}
          />
          <GenerateButton 
            onClick={handleSubmit}
            disabled={isGenerating}
            isGenerating={isGenerating}
            user={user}
          />
        </div>
      </div>
    </div>
  );
};
