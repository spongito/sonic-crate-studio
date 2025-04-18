
import { useState } from "react";
import { ArrowRight, Sliders, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import BackgroundCells from "@/components/ui/background-cells";
import { SearchDialog, SearchParams } from "@/components/Dashboard/AdvancedSearch/SearchDialog";
import { SignInDialog } from "@/components/auth/SignInDialog";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface HeroSectionProps {
  onPlaylistGenerated?: (data: any) => void;
  setShowPlaylist?: (show: boolean) => void;
}

const HeroSection = ({ onPlaylistGenerated, setShowPlaylist }: HeroSectionProps) => {
  const [prompt, setPrompt] = useState("");
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { user, subscription, checkSubscription } = useAuth();
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!user) {
      setShowSignIn(true);
      return;
    }
    
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }
    
    if (subscription?.remaining_generations === 0 && !subscription?.is_premium) {
      toast.info("This is a Premium feature. Upgrade to continue.");
      navigate("/dashboard");
      return;
    }
    
    try {
      setIsGenerating(true);
      if (setShowPlaylist) setShowPlaylist(false);
      
      const { data: processedData, error } = await supabase.functions
        .invoke('process-music-request', {
          body: { 
            prompt,
            advancedParams: {
              mode: "club-ready",
              description: "",
              genre: "",
              length: "1.5h",
              commercialFactor: 50,
              referenceArtists: ""
            }
          }
        });
      
      if (error) {
        console.error("Processing error details:", error);
        throw error;
      }
      
      if (processedData && processedData.error) {
        throw new Error(processedData.error);
      }
      
      if (!processedData) {
        throw new Error("Failed to generate playlist data: No data returned");
      }
      
      if (!processedData.tracks) {
        throw new Error("Failed to generate playlist data: No tracks found");
      }
      
      if (!subscription?.is_premium) {
        await supabase.functions.invoke('increment-playlist-count');
        await checkSubscription();
      }
      
      if (onPlaylistGenerated) {
        onPlaylistGenerated(processedData);
      }
      
      toast.success("Playlist generated successfully!");
      
    } catch (error: any) {
      console.error("Generation error:", error);
      toast.error(error.message || "Failed to generate playlist. Please try again with a different prompt.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleAdvancedSearchSubmit = async (params: SearchParams) => {
    if (!user) {
      setShowSignIn(true);
      return;
    }
    
    navigate("/music-finder");
  };

  return (
    <div className="relative min-h-screen">
      <BackgroundCells className="absolute inset-0 -z-10" />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="animate-fade-in max-w-4xl w-full text-center space-y-6 pt-24">
          <div className="h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-gold to-gold-dark animate-pulse-gold mb-4" />
          
          <h1 className="text-gradient text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight">
            Sound Designed by You
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Describe your playlist idea. Let our AI do the digging.
          </p>
          
          <div className="max-w-2xl mx-auto w-full mt-8">
            <div className="glass-morphism p-2 sm:p-3 flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="curate a soulful afrobeat set for golden hour"
                className="flex-1 bg-background/60 border-white/10"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                disabled={isGenerating}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border-white/10 hover:bg-white/5"
                  onClick={() => setShowAdvancedSearch(true)}
                  disabled={isGenerating}
                >
                  <Sliders className="h-4 w-4" />
                </Button>
                <Button 
                  className="bg-gold hover:bg-gold-dark text-black font-medium"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      Find Songs
                      {user && <ArrowRight className="ml-2 h-4 w-4" />}
                    </>
                  )}
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Free tier: 15 generations per month
            </p>
          </div>
        </div>
      </div>

      <SearchDialog
        open={showAdvancedSearch}
        onOpenChange={setShowAdvancedSearch}
        onSubmit={handleAdvancedSearchSubmit}
      />

      <SignInDialog 
        open={showSignIn} 
        onOpenChange={setShowSignIn}
      />
    </div>
  );
};

export default HeroSection;
