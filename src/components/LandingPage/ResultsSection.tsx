
import { Track } from "@/types/table";
import TabPlaylistView from "@/components/TabPlaylistView";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { usePlaylistOperations } from "@/hooks/use-playlist-operations";
import { useTracks } from "@/context/TracksContext";

interface ResultsSectionProps {
  showPlaylist: boolean;
  playlistData: any;
}

const ResultsSection = ({ showPlaylist, playlistData }: ResultsSectionProps) => {
  const { user } = useAuth();
  const { savePlaylist, isSaving } = usePlaylistOperations();
  const { toggleLike } = useTracks();

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

  const handleSavePlaylist = async (platform: string) => {
    if (!user) {
      toast.error("Please sign in to save playlists");
      return;
    }

    try {
      await savePlaylist(playlistData);
      toast.success(`Playlist saved to your ${platform} account`);
    } catch (error) {
      console.error("Error saving playlist:", error);
      toast.error("Failed to save playlist");
    }
  };
  
  const handleLikeChange = async (trackId: string, liked: boolean) => {
    if (!user) {
      toast.error("Please sign in to save tracks");
      return;
    }
    
    try {
      // Fixed: Pass the CURRENT state (opposite of new liked state) to toggleLike
      // toggleLike expects the current state BEFORE toggling
      await toggleLike(trackId, !liked);
      toast.success(liked ? "Added to your favorites" : "Removed from your favorites");
    } catch (error) {
      console.error("Error toggling track like:", error);
      toast.error("Failed to update liked status");
    }
  };

  if (!showPlaylist || !playlistData) {
    return null;
  }

  // Extract liked track IDs if available, otherwise use empty array
  const userLikedTrackIds = (playlistData.userLikedTrackIds || []);

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 py-8 mt-6">
      <TabPlaylistView
        tracks={formattedTracks}
        userLikedTrackIds={userLikedTrackIds}
        onLikeChange={handleLikeChange}
        onSavePlaylist={handleSavePlaylist}
        playlistName={playlistData.name || "Generated Playlist"}
        className="mt-6"
      />
    </div>
  );
};

export default ResultsSection;
