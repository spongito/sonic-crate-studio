
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { ViewToggle } from "./ViewToggle";
import { SortControl } from "./SortControl";
import { ListView } from "./ListView";
import { toast } from "sonner";
import { PlaylistSkeleton } from "./PlaylistSkeleton";

export const PlaylistList = () => {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState<"newest" | "oldest" | "alphabetical">("newest");
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    const fetchPlaylists = async () => {
      try {
        setLoading(true);
        
        let query = supabase
          .from("playlists")
          .select("*")
          .eq("user_id", user.id); // Only fetch playlists for the logged-in user
        
        // Apply sorting
        if (sort === "newest") {
          query = query.order("created_at", { ascending: false });
        } else if (sort === "oldest") {
          query = query.order("created_at", { ascending: true });
        } else if (sort === "alphabetical") {
          query = query.order("name", { ascending: true });
        }
        
        const { data, error } = await query;
        
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
  }, [sort, user]);
  
  return (
    <div className="space-y-6">
      {loading ? (
        <div className="space-y-6">
          <PlaylistSkeleton count={3} />
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {playlists.length === 0 ? "No playlists yet" : `${playlists.length} Playlists`}
              </h2>
            </div>
            
            <div className="flex gap-2">
              <SortControl value={sort} onChange={setSort} />
              <ViewToggle view={view} onViewChange={setView} />
            </div>
          </div>
          
          {playlists.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Generate your first playlist to see it here.</p>
            </div>
          ) : (
            <ListView playlists={playlists} />
          )}
        </>
      )}
    </div>
  );
};
