
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import BackgroundCells from "@/components/ui/background-cells";
import { SignInDialog } from "@/components/auth/SignInDialog";
import { useNavigate } from "react-router-dom";
import { PlaylistGeneratorPanel } from "@/components/PlaylistGenerator/PlaylistGeneratorPanel";
import InlinePlaylistGenerator from "@/components/LandingPage/InlinePlaylistGenerator";

interface HeroSectionProps {
  onPlaylistGenerated?: (data: any) => void;
  setShowPlaylist?: (show: boolean) => void;
}

const HeroSection = ({ onPlaylistGenerated, setShowPlaylist }: HeroSectionProps) => {
  const [showSignIn, setShowSignIn] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [playlistData, setPlaylistData] = useState<any>(null);
  const [showInlinePlaylist, setShowInlinePlaylist] = useState(false);

  const handlePlaylistGenerated = (data: any) => {
    setPlaylistData(data);
    setShowInlinePlaylist(true);
    if (onPlaylistGenerated) {
      onPlaylistGenerated(data);
    }
    if (setShowPlaylist) {
      setShowPlaylist(true);
    }
  };

  return (
    <div className="relative min-h-screen">
      <BackgroundCells className="absolute inset-0 -z-10" />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="animate-fade-in max-w-4xl w-full text-center space-y-6 pt-24 px-4">
          <div className="h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-gold to-gold-dark animate-pulse-gold mb-4" />
          
          <h1 className="text-gradient text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight">
            Sound Designed by You
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Describe your playlist idea. Let our AI do the digging.
          </p>
          
          <div className="max-w-2xl mx-auto w-full mt-8">
            <div className="glass-morphism p-4">
              <PlaylistGeneratorPanel 
                isHomepage={true}
                onPlaylistGenerated={handlePlaylistGenerated}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Free tier: 15 generations per month
            </p>
          </div>
          
          {showInlinePlaylist && playlistData && (
            <div className="mt-8 animate-fade-in">
              <InlinePlaylistGenerator 
                playlistData={playlistData} 
                className="max-w-7xl mx-auto px-4 py-12"
              />
            </div>
          )}
        </div>
      </div>

      <SignInDialog 
        open={showSignIn} 
        onOpenChange={setShowSignIn}
      />
    </div>
  );
};

export default HeroSection;
