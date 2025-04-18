import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import DashboardCards from "@/components/Dashboard/DashboardCards";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import PlaylistViewer from "@/components/Dashboard/PlaylistViewer";
import ProfileCard from "@/components/Dashboard/ProfileCard";
import UpgradeModal from "@/components/Dashboard/UpgradeModal";
import { StatCard } from "@/components/Dashboard/StatCard";
import { CurationStats } from "@/components/Dashboard/CurationStats";
import { MusicPersonality } from "@/components/Dashboard/MusicPersonality";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const Dashboard = () => {
  const [prompt, setPrompt] = useState("");
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
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

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }
    
    if (subscription?.remaining_generations === 0 && !subscription?.is_premium) {
      setShowUpgradeModal(true);
      return;
    }
    
    try {
      setIsGenerating(true);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (!subscription?.is_premium) {
        await supabase.functions.invoke('increment-playlist-count');
        await checkSubscription();
      }
      
      setShowPlaylist(true);
      toast.success("Playlist generated successfully!");
      
    } catch (error) {
      toast.error("Failed to generate playlist");
      console.error("Generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
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

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-6">
            <div className="glass-morphism p-4 flex flex-col sm:flex-row gap-3 rounded-xl">
              <Input
                placeholder="curate a soulful afrobeat set for golden hour"
                className="flex-1 bg-white/5 border-white/10 focus:border-gold/30 focus:ring-gold/20"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                disabled={isGenerating}
              />
              <Button 
                className="neo-gold-button"
                onClick={handleGenerate}
                disabled={isGenerating || (!subscription?.is_premium && subscription?.remaining_generations === 0)}
              >
                {isGenerating ? "Generating..." : "Generate Playlist"}
                {!isGenerating && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
            
            {showPlaylist && (
              <div className="mt-8 animate-fade-in">
                <PlaylistViewer />
              </div>
            )}
          </div>
          
          <div className="md:w-80">
            <ProfileCard onUpgrade={() => setShowUpgradeModal(true)} />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mt-12 pt-6 border-t border-white/5 text-white/90">
          Explore Features
        </h2>
        <DashboardCards />
      </div>
      
      <UpgradeModal 
        open={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />
    </DashboardLayout>
  );
};

export default Dashboard;
