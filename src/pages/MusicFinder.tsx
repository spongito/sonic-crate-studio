
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import PlaylistViewer from "@/components/Dashboard/PlaylistViewer";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const MusicFinder = () => {
  const [prompt, setPrompt] = useState("");
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchParams] = useSearchParams();
  const { subscription, checkSubscription, user } = useAuth();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }
    
    // Check if user has reached generation limit and is not premium
    if (subscription?.remaining_generations === 0 && !subscription?.is_premium) {
      toast.info("This is a Premium feature. Upgrade to continue.");
      return;
    }
    
    try {
      setIsGenerating(true);
      
      // Save the playlist to Supabase
      const { error: insertError } = await supabase
        .from("playlists")
        .insert({
          name: format(new Date(), "MMM d - h:mm a"),
          prompt: prompt,
          description: "", // Optional description
          results: [], // Placeholder for now
          user_id: user?.id || '', // Use user.id instead of subscription.user_id
          is_public: true,
          genres: [] // Add empty genres array
        });

      if (insertError) throw insertError;
      
      // Simulating API call to GPT
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update playlist generation count in database
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
        <div className="flex flex-col gap-6">
          <div className="flex-1 space-y-6">
            <h1 className="text-4xl font-bold bg-gradient-to-br from-white via-white/90 to-white/70 bg-clip-text text-transparent">
              Music Finder
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
                {isGenerating ? "Generating..." : "Find Songs"}
                {!isGenerating && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
            
            {showPlaylist && (
              <div className="mt-8 animate-fade-in">
                <PlaylistViewer />
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MusicFinder;
