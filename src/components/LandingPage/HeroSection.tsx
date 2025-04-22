
import BackgroundCells from "@/components/ui/background-cells";
import HeroGlow from "./HeroGlow";
import HeroContent from "./HeroContent";
import HeroSearch from "./HeroSearch";

interface HeroSectionProps {
  onPlaylistGenerated?: (data: any) => void;
  setShowPlaylist?: (show: boolean) => void;
}

const HeroSection = ({ onPlaylistGenerated, setShowPlaylist }: HeroSectionProps) => {
  return (
    <div className="relative min-h-screen">
      <BackgroundCells className="absolute inset-0 -z-10" />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 md:px-8">
        <div className="animate-fade-in max-w-4xl w-full text-center space-y-8 pt-24 pb-12 sm:space-y-10 px-4 sm:px-0">
          <HeroGlow />
          <HeroContent />
          <HeroSearch 
            onPlaylistGenerated={onPlaylistGenerated}
            setShowPlaylist={setShowPlaylist}
          />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
