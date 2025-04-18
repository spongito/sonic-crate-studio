
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { ViewToggle } from "./ViewToggle";
import { SortControl, type SortOption } from "./SortControl";
import { PlaylistModal } from "./PlaylistModal";
import { ListView } from "./ListView";
import { toast } from "sonner";

interface Track {
  title: string;
  artist: string;
  album?: string;
  spotify_id?: string;
  duration?: string;
  match_score?: number;
  audio_features?: {
    bpm?: number;
    key?: number;
    mode?: number;
  };
  platform?: string;
  platform_url?: string;
  cover_url?: string;
}

interface Playlist {
  id: string;
  name: string;
  prompt: string;
  description?: string;
  created_at: string;
  results: Track[];
  user_id: string;
  is_public: boolean;
  updated_at: string;
  genres: string[];
  settings?: any;
  tags?: string[];
}

export function PlaylistList() {
  const [view, setView] = useState<"grid" | "list">(() => 
    localStorage.getItem("playlistView") as "grid" | "list" || "grid"
  );
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  const { data: playlists, isLoading } = useQuery({
    queryKey: ["playlists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("playlists")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Process and enhance playlist results
      return data.map((playlist: any) => ({
        ...playlist,
        results: (playlist.results || []).map((track: any, index: number) => ({
          ...track,
          // Ensure all required fields are present
          title: track.title || track.name || "Unknown Track",
          artist: track.artist || "Unknown Artist",
          album: track.album || "Unknown Album",
          spotify_id: track.spotify_id || track.id || `spotify:track:${Math.random().toString(36).substring(2, 15)}`,
          match_score: track.match_score || track.score || Math.floor(Math.random() * 20) + 80,
          platform: track.platform || "spotify",
          platform_url: track.external_url || track.platform_url || `https://open.spotify.com/track/${(track.spotify_id || '').split(':').pop()}`,
          cover_url: track.image || track.cover_url || "",
          audio_features: track.audio_features || {
            // We'll fetch these later, but provide placeholder structure
            bpm: undefined,
            key: undefined,
            mode: undefined
          }
        }))
      })) as Playlist[];
    }
  });

  useEffect(() => {
    localStorage.setItem("playlistView", view);
  }, [view]);

  const sortedPlaylists = playlists?.slice().sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      default: // newest
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const handleDeletePlaylist = async (id: string) => {
    try {
      const { error } = await supabase
        .from("playlists")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      toast.success("Playlist deleted successfully");
      setSelectedPlaylist(null);
    } catch (error) {
      console.error("Error deleting playlist:", error);
      toast.error("Failed to delete playlist");
    }
  };

  if (isLoading) {
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="neo-card animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-white/5 rounded w-3/4"></div>
              <div className="h-3 bg-white/5 rounded w-1/2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <SortControl value={sortBy} onValueChange={setSortBy} />
        <ViewToggle view={view} onViewChange={setView} />
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPlaylists?.map((playlist) => (
            <Card 
              key={playlist.id} 
              className="neo-card group hover:border-gold/20 transition-colors cursor-pointer"
              onClick={() => setSelectedPlaylist(playlist)}
            >
              <CardHeader>
                <CardTitle className="text-xl group-hover:text-gold transition-colors">
                  {playlist.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(playlist.created_at), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white/60 line-clamp-2">
                  {playlist.prompt}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <ListView 
          playlists={sortedPlaylists || []} 
          onPlaylistClick={setSelectedPlaylist} 
        />
      )}

      <PlaylistModal 
        playlist={selectedPlaylist}
        isOpen={!!selectedPlaylist}
        onClose={() => setSelectedPlaylist(null)}
        onDelete={handleDeletePlaylist}
      />
    </div>
  );
}
