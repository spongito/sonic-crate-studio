
import React, { useState, useEffect } from 'react';
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import PlaylistViewer from "@/components/Dashboard/PlaylistViewer";
import { StatCard } from "@/components/Dashboard/StatCard";
import { CurationStats } from "@/components/Dashboard/CurationStats";
import { MusicPersonality } from "@/components/Dashboard/MusicPersonality";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const Dashboard = () => {
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [searchParams] = useSearchParams();
  const { subscription, checkSubscription, user } = useAuth();

  const { data: userProfile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      return data;
    },
    enabled: !!user?.id
  });

  useEffect(() => {
    const paymentSuccess = searchParams.get("payment_success");
    const paymentCanceled = searchParams.get("payment_canceled");
    
    if (paymentSuccess) {
      toast.success("Payment successful! You now have premium access.");
      checkSubscription();
    }
    
    if (paymentCanceled) {
      toast.error("Payment canceled. You can try again later.");
    }
  }, [searchParams, checkSubscription]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
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

        {showPlaylist && (
          <div className="animate-fade-in">
            <PlaylistViewer />
          </div>
        )}
        
        <h2 className="text-2xl font-bold mt-12 pt-6 border-t border-white/5 text-white/90">
          Explore Features
        </h2>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
