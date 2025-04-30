
import React from 'react';
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { PaymentNotification } from "@/components/Dashboard/PaymentNotification";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { FeatureCards } from "@/components/Dashboard/FeatureCards";
import { RecentlyLikedTracks } from "@/components/Dashboard/RecentlyLikedTracks";
import { YourPlaylists } from "@/components/Dashboard/YourPlaylists";
import { ExploreFeatures } from "@/components/Dashboard/ExploreFeatures";

const Dashboard = () => {
  const { checkSubscription, user } = useAuth();

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
      
      <div className="space-y-10">
        <h1 className="text-3xl font-bold text-white">Welcome to Assorted Audio</h1>
        
        {/* Feature Cards */}
        <FeatureCards />
        
        {/* Recently Liked Tracks */}
        <RecentlyLikedTracks />
        
        {/* Your Playlists */}
        <YourPlaylists />
        
        {/* Explore Features */}
        <ExploreFeatures />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
