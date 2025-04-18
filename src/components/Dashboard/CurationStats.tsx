
import { Activity, Download, Music, Clock } from "lucide-react";

interface CurationStatsProps {
  playlistsCount: number;
  songsDiscovered: number;
  minutesSpent: number;
  exportsCount: number;
}

export function CurationStats({ playlistsCount, songsDiscovered, minutesSpent, exportsCount }: CurationStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center">
          <Music className="h-4 w-4 text-gold" />
        </div>
        <div>
          <p className="text-2xl font-semibold">{playlistsCount}</p>
          <p className="text-sm text-white/60">Playlists Created</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center">
          <Activity className="h-4 w-4 text-gold" />
        </div>
        <div>
          <p className="text-2xl font-semibold">{songsDiscovered}</p>
          <p className="text-sm text-white/60">Songs Discovered</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center">
          <Clock className="h-4 w-4 text-gold" />
        </div>
        <div>
          <p className="text-2xl font-semibold">{minutesSpent}</p>
          <p className="text-sm text-white/60">Minutes Digging</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center">
          <Download className="h-4 w-4 text-gold" />
        </div>
        <div>
          <p className="text-2xl font-semibold">{exportsCount}</p>
          <p className="text-sm text-white/60">Exports</p>
        </div>
      </div>
    </div>
  );
}
