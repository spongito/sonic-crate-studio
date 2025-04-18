
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import DashboardCards from "@/components/Dashboard/DashboardCards";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import PlaylistViewer from "@/components/Dashboard/PlaylistViewer";
import ProfileCard from "@/components/Dashboard/ProfileCard";
import UpgradeModal from "@/components/Dashboard/UpgradeModal";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const [prompt, setPrompt] = useState("");
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchParams] = useSearchParams();
  const { subscription, checkSubscription } = useAuth();

  useEffect(() => {
    // Check for payment status from URL params
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
      
      // Simulating API call to GPT
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update playlist generation count in database
      if (!subscription?.is_premium) {
        // Fix: Pass the function name as a string and use an empty object for parameters
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
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-6">
            <h1 className="text-4xl font-bold bg-gradient-to-br from-white via-white/90 to-white/70 bg-clip-text text-transparent">
              Playlist Generator
            </h1>
            <p className="text-white/60">
              Describe the mood, genre, or occasion and let our AI create the perfect playlist for you.
            </p>
            
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
