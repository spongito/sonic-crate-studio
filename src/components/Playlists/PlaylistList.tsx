
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PlaylistCard } from "./PlaylistCard";
import { PlaylistSkeleton } from "./PlaylistSkeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export const PlaylistList = () => {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

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
        
        setPlaylists(data || []);
      } catch (error) {
        console.error("Error fetching playlists:", error);
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlaylists();
  }, [user]);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {playlists.length === 0 ? "No playlists yet" : `${playlists.length} Playlists`}
        </h2>
        <Link to="/music-finder">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Playlist
          </Button>
        </Link>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <PlaylistSkeleton count={6} />
        </div>
      ) : playlists.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Generate your first playlist to see it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {playlists.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              id={playlist.id}
              title={playlist.name}
              coverUrl={playlist.cover_url}
              trackCount={(playlist.results as any[]).length}
              createdAt={playlist.created_at}
            />
          ))}
        </div>
      )}
    </div>
  );
};
