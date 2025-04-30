
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PlaylistCard } from "./PlaylistCard";
import { PlaylistSkeleton } from "./PlaylistSkeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { ViewToggle } from "./ViewToggle";
import { ListView } from "./ListView";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Playlist } from "./types";

// Local storage key for view preference
const VIEW_PREFERENCE_KEY = "playlist-view-preference";

export const PlaylistList = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  // Initialize view state based on local storage or device type
  const getInitialView = () => {
    const savedView = localStorage.getItem(VIEW_PREFERENCE_KEY);
    if (savedView === "grid" || savedView === "list") {
      return savedView;
    }
    // Default to list view on mobile, grid view on desktop
    return isMobile ? "list" : "grid";
  };
  
  const [view, setView] = useState<"grid" | "list">(getInitialView);

  // Save view preference to localStorage
  useEffect(() => {
    localStorage.setItem(VIEW_PREFERENCE_KEY, view);
  }, [view]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    const fetchPlaylists = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from("playlists")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        
        if (error) {
          console.error("Error fetching playlists:", error);
          toast.error("Failed to load playlists");
          return;
        }
        
        // Fix the TypeScript issue by ensuring data is properly typed as Playlist[]
        setPlaylists(data as Playlist[]);
      } catch (error) {
        console.error("Error fetching playlists:", error);
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlaylists();
  }, [user]);

  const handleViewChange = (newView: "grid" | "list") => {
    setView(newView);
  };

  const handlePlaylistClick = (playlist: Playlist) => {
    // Navigate to playlist detail view
  };
  
  return (
    <div className="space-y-6">
      {/* Responsive header layout - stacks on mobile, side-by-side on desktop */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold">
          {playlists.length === 0 ? "No playlists yet" : `${playlists.length} Playlists`}
        </h2>
        <div className="flex items-center justify-between sm:justify-end gap-4">
          <ViewToggle view={view} onViewChange={handleViewChange} />
          <Link to="/music-finder">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Playlist
            </Button>
          </Link>
        </div>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <PlaylistSkeleton count={6} />
        </div>
      ) : playlists.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Generate your first playlist to see it here.</p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {playlists.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              id={playlist.id}
              title={playlist.name}
              coverUrl={playlist.cover_image_url}
              trackCount={(playlist.results as any[]).length}
              createdAt={playlist.created_at}
            />
          ))}
        </div>
      ) : (
        <ListView 
          playlists={playlists} 
          onPlaylistClick={handlePlaylistClick} 
        />
      )}
    </div>
  );
};
