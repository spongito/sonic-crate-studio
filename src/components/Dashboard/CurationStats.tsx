
import { Activity, Download, Music, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";

interface CurationStatsProps {
  playlistsCount: number;
  songsDiscovered: number;
  minutesSpent: number;
  exportsCount: number;
}

export function CurationStats({ playlistsCount, songsDiscovered, minutesSpent, exportsCount }: CurationStatsProps) {
  const { user } = useAuth();
  const memberSince = new Date(user?.created_at || Date.now()).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12 border-2 border-white/10">
          <AvatarImage src={user?.user_metadata?.avatar_url} />
          <AvatarFallback className="bg-white/5">
            {user?.user_metadata?.name?.substring(0, 2).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium text-white/90">{user?.user_metadata?.name || 'User'}</h3>
          <p className="text-sm text-white/60">Member since {memberSince}</p>
        </div>
      </div>

      <Separator className="bg-white/10" />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center">
            <Music className="h-4 w-4 text-gold" />
          </div>
          <p className="text-2xl font-semibold text-white/90">{playlistsCount}</p>
          <p className="text-sm text-white/60">Playlists Created</p>
        </div>
        
        <div className="space-y-1">
          <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center">
            <Activity className="h-4 w-4 text-gold" />
          </div>
          <p className="text-2xl font-semibold text-white/90">{songsDiscovered}</p>
          <p className="text-sm text-white/60">Songs Discovered</p>
        </div>
        
        <div className="space-y-1">
          <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center">
            <Clock className="h-4 w-4 text-gold" />
          </div>
          <p className="text-2xl font-semibold text-white/90">{minutesSpent}</p>
          <p className="text-sm text-white/60">Minutes Digging</p>
        </div>
        
        <div className="space-y-1">
          <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center">
            <Download className="h-4 w-4 text-gold" />
          </div>
          <p className="text-2xl font-semibold text-white/90">{exportsCount}</p>
          <p className="text-sm text-white/60">Exports</p>
        </div>
      </div>
    </div>
  );
}
