
import React, { useState } from 'react';
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import PlaylistViewer from "@/components/Dashboard/PlaylistViewer";
import { DashboardStats } from "@/components/Dashboard/DashboardStats";
import { ExploreFeatures } from "@/components/Dashboard/ExploreFeatures";
import { PaymentNotification } from "@/components/Dashboard/PaymentNotification";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const Dashboard = () => {
  const [showPlaylist, setShowPlaylist] = useState(false);
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

  return (
    <DashboardLayout>
      <PaymentNotification checkSubscription={checkSubscription} />
      
      <div className="space-y-6">
        <DashboardStats userProfile={userProfile} />

        {showPlaylist && (
          <div className="animate-fade-in">
            <PlaylistViewer />
          </div>
        )}
        
        <ExploreFeatures />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
