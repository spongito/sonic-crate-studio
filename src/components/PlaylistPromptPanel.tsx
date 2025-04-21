
import React from "react";
import PromptBar from "./PromptBar";

interface PlaylistPromptPanelProps {
  prompt: string;
  setPrompt: (value: string) => void;
  isGenerating: boolean;
  onGenerate: () => void;
  disabled?: boolean;
  onAdvanced?: () => void;
}

const PlaylistPromptPanel = ({
  prompt,
  setPrompt,
  isGenerating,
  onGenerate,
  disabled = false,
  onAdvanced,
}: PlaylistPromptPanelProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto px-6 sm:px-8">
      <div className="glass-morphism p-3 sm:p-4 flex flex-col gap-4 rounded-lg">
        <PromptBar
          prompt={prompt}
          setPrompt={setPrompt}
          isGenerating={isGenerating}
          disabled={disabled}
          onGenerate={onGenerate}
          onAdvanced={onAdvanced}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-4 sm:mt-5 text-center">
        Free tier: 15 generations per month
      </p>
    </div>
  );
};

export default PlaylistPromptPanel;

