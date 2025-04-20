
import React from 'react';
import { StatCard } from "@/components/Dashboard/StatCard";
import { CurationStats } from "@/components/Dashboard/CurationStats";
import { MusicPersonality } from "@/components/Dashboard/MusicPersonality";

interface DashboardStatsProps {
  userProfile: {
    playlists_generated?: number;
    songs_discovered?: number;
    minutes_spent_digging?: number;
    exports_count?: number;
    most_common_genre?: string;
    curator_style?: string;
    most_used_prompt?: string;
  } | null;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ userProfile }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <StatCard title="Curation Activity">
        <CurationStats
          playlistsCount={userProfile?.playlists_generated || 0}
          songsDiscovered={userProfile?.songs_discovered || 0}
          minutesSpent={userProfile?.minutes_spent_digging || 0}
          exportsCount={userProfile?.exports_count || 0}
        />
      </StatCard>
      
      <StatCard title="Your Music Personality">
        <MusicPersonality
          mostCommonGenre={userProfile?.most_common_genre || "Exploring"}
          curatorStyle={userProfile?.curator_style || "Underground Head"}
          averagePlaylistLength={12}
          mostUsedPrompt={userProfile?.most_used_prompt}
        />
      </StatCard>
    </div>
  );
};
