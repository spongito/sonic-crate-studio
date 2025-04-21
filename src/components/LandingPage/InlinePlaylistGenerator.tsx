
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Folder } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePlaylistOperations } from "@/hooks/use-playlist-operations";
import { toast } from "sonner";
import GeneratedPlaylistTable from "@/components/GeneratedPlaylistTable";
import { Track } from "@/types/table";
import { useAuth } from "@/context/AuthContext";

interface InlinePlaylistGeneratorProps {
  playlistData: any;
  className?: string;
}

export default function InlinePlaylistGenerator({ playlistData, className }: InlinePlaylistGeneratorProps) {
  const navigate = useNavigate();
  const { savePlaylist, isSaving } = usePlaylistOperations();
  const [saved, setSaved] = useState(false);
  const { user } = useAuth();
  
  // Transform tracks data to match Track format
  const formattedTracks: Track[] = (playlistData?.tracks || []).map((track: any) => ({
    id: track.id || track.spotify_id || `track-${Math.random()}`,
    title: track.title || track.name || "Unknown Track",
    artist: Array.isArray(track.artist) ? track.artist : [track.artist || "Unknown Artist"],
    album: track.album || "Unknown Album",
    platform: track.platform || "spotify",
    image_url: track.image_url || track.cover_url || track.image,
    bpm: track.bpm || track.audio_features?.bpm,
    key_signature: track.key_signature || (track.audio_features ? `${track.audio_features.key} ${track.audio_features.mode === 1 ? 'Major' : 'Minor'}` : null),
    genre: Array.isArray(track.genre) ? track.genre : track.genre ? [track.genre] : null,
    release_year: track.release_year,
    duration: track.duration,
    platform_url: track.platform_url || track.external_url,
  }));
  
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
      
      {formattedTracks.length > 0 ? (
        <GeneratedPlaylistTable 
          tracks={formattedTracks} 
          userLikedTrackIds={[]}
          showControls={true}
          fullWidth={true}
        />
      ) : (
        <div className="text-center py-8 text-white/70">
          No tracks found in the generated playlist.
        </div>
      )}
    </div>
  );
}
