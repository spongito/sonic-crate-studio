
import { Disc2, Sparkles, ListMusic, MessageCircle } from "lucide-react";

interface MusicPersonalityProps {
  mostCommonGenre: string;
  curatorStyle: string;
  averagePlaylistLength: number;
  mostUsedPrompt?: string;
}

export function MusicPersonality({ 
  mostCommonGenre, 
  curatorStyle, 
  averagePlaylistLength,
  mostUsedPrompt 
}: MusicPersonalityProps) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-2">
        <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center mb-3">
          <Disc2 className="h-5 w-5 text-gold" />
        </div>
        <p className="text-xl font-semibold text-white/90">{mostCommonGenre || "No genre yet"}</p>
        <p className="text-sm text-white/60">Top Genre</p>
      </div>
      
      <div className="space-y-2">
        <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center mb-3">
          <Sparkles className="h-5 w-5 text-gold" />
        </div>
        <p className="text-xl font-semibold text-white/90">{curatorStyle}</p>
        <p className="text-sm text-white/60">Your Style</p>
      </div>
      
      <div className="space-y-2">
        <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center mb-3">
          <ListMusic className="h-5 w-5 text-gold" />
        </div>
        <p className="text-xl font-semibold text-white/90">{averagePlaylistLength}</p>
        <p className="text-sm text-white/60">Avg. Playlist Length</p>
      </div>
      
      {mostUsedPrompt && (
        <div className="space-y-2">
          <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center mb-3">
            <MessageCircle className="h-5 w-5 text-gold" />
          </div>
          <p className="text-xl font-semibold text-white/90">{mostUsedPrompt}</p>
          <p className="text-sm text-white/60">Favorite Prompt</p>
        </div>
      )}
    </div>
  );
}
