
import { useState } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import DashboardCards from "@/components/Dashboard/DashboardCards";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import PlaylistViewer from "@/components/Dashboard/PlaylistViewer";
import ProfileCard from "@/components/Dashboard/ProfileCard";
import UpgradeModal from "@/components/Dashboard/UpgradeModal";

const Dashboard = () => {
  const [prompt, setPrompt] = useState("");
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleGenerate = () => {
    // For demo purposes, we'll just show the playlist
    // In a real app, this would call the GPT API
    console.log("Generating playlist with prompt:", prompt);
    setShowPlaylist(true);
    
    // Simulating upgrade modal after X generations
    // In a real app, this would check the user's generation count
    if (Math.random() > 0.5) {
      setShowUpgradeModal(true);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-6">
            <h1 className="text-3xl font-bold">Playlist Generator</h1>
            <p className="text-muted-foreground">
              Describe the mood, genre, or occasion and let our AI create the perfect playlist for you.
            </p>
            
            <div className="glass-morphism p-3 flex flex-col sm:flex-row gap-3 rounded-xl">
              <Input
                placeholder="curate a soulful afrobeat set for golden hour"
                className="flex-1 bg-background/60 border-white/10"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              />
              <Button 
                className="bg-gold hover:bg-gold-dark text-black font-medium"
                onClick={handleGenerate}
              >
                Generate Playlist
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            {showPlaylist && (
              <div className="mt-8 animate-fade-in">
                <PlaylistViewer />
              </div>
            )}
          </div>
          
          <div className="md:w-80">
            <ProfileCard />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mt-12 pt-6 border-t border-border">
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
