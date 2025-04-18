
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Folder } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePlaylistOperations } from "@/hooks/use-playlist-operations";
import { toast } from "sonner";
import { TrackTable } from "@/components/TrackTable";

interface InlinePlaylistGeneratorProps {
  playlistData: any;
  className?: string;
}

export default function InlinePlaylistGenerator({ playlistData, className }: InlinePlaylistGeneratorProps) {
  const navigate = useNavigate();
  const { savePlaylist, isSaving } = usePlaylistOperations();
  const [saved, setSaved] = useState(false);
  
  const handleSavePlaylist = async () => {
    await savePlaylist(playlistData);
    setSaved(true);
    toast.success("Playlist saved successfully!");
  };
  
  const handleGoToPlaylists = () => {
    navigate("/playlists");
  };

  return (
    <div className={`space-y-6 glass-morphism p-6 rounded-xl ${className}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gradient">
          {playlistData.name || "Generated Playlist"}
        </h2>
        
        <div className="flex gap-3">
          <Button 
            onClick={handleSavePlaylist} 
            disabled={isSaving || saved}
            className="neo-gold-button"
          >
            {isSaving ? "Saving..." : saved ? "Saved" : "Save Playlist"}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleGoToPlaylists}
            className="border-white/10"
          >
            <Folder className="mr-2 h-4 w-4" />
            My Playlists
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <TrackTable tracks={playlistData?.tracks || []} />
      </div>
    </div>
  );
}
