
import { useState } from "react";
import { ArrowRight, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import BackgroundCells from "@/components/ui/background-cells";
import { SearchDialog, SearchParams } from "@/components/Dashboard/AdvancedSearch/SearchDialog";

const HeroSection = () => {
  const [prompt, setPrompt] = useState("");
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const { signInWithSpotify, user } = useAuth();

  const handleGenerate = () => {
    if (!user) {
      signInWithSpotify();
      return;
    }
    window.location.href = "/dashboard";
  };

  const handleAdvancedSearchSubmit = (params: SearchParams) => {
    console.log("Advanced search params:", params);
    handleGenerate();
  };

  return (
    <BackgroundCells className="min-h-screen">
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
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-white/10 hover:bg-white/5"
                onClick={() => setShowAdvancedSearch(true)}
              >
                <Sliders className="h-4 w-4" />
              </Button>
              <Button 
                className="bg-gold hover:bg-gold-dark text-black font-medium"
                onClick={handleGenerate}
              >
                {user ? "Generate Playlist" : "Sign in with Spotify"}
                {user && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Free tier: 15 generations per month
          </p>
        </div>
      </div>

      <SearchDialog
        open={showAdvancedSearch}
        onOpenChange={setShowAdvancedSearch}
        onSubmit={handleAdvancedSearchSubmit}
      />
    </BackgroundCells>
  );
};

export default HeroSection;
