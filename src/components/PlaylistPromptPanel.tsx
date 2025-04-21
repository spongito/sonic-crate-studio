
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
    <div className="w-full max-w-2xl mx-auto">
      <div className="glass-morphism p-2 sm:p-3 flex flex-col gap-3">
        <PromptBar
          prompt={prompt}
          setPrompt={setPrompt}
          isGenerating={isGenerating}
          disabled={disabled}
          onGenerate={onGenerate}
          onAdvanced={onAdvanced}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-3 text-center">
        Free tier: 15 generations per month
      </p>
    </div>
  );
};

export default PlaylistPromptPanel;
