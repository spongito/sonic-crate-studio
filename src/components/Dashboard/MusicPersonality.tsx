
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center">
          <Disc2 className="h-4 w-4 text-gold" />
        </div>
        <div>
          <p className="text-lg font-medium text-white/90">{mostCommonGenre || "No genre yet"}</p>
          <p className="text-sm text-white/60">Top Genre</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-gold" />
        </div>
        <div>
          <p className="text-lg font-medium text-white/90">{curatorStyle}</p>
          <p className="text-sm text-white/60">Your Style</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center">
          <ListMusic className="h-4 w-4 text-gold" />
        </div>
        <div>
          <p className="text-lg font-medium text-white/90">{averagePlaylistLength}</p>
          <p className="text-sm text-white/60">Avg. Playlist Length</p>
        </div>
      </div>
      
      {mostUsedPrompt && (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center">
            <MessageCircle className="h-4 w-4 text-gold" />
          </div>
          <div>
            <p className="text-lg font-medium text-white/90">{mostUsedPrompt}</p>
            <p className="text-sm text-white/60">Favorite Prompt</p>
          </div>
        </div>
      )}
    </div>
  );
}
