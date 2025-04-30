
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { PlaylistSkeleton } from "@/components/Playlists/PlaylistSkeleton";

interface Playlist {
  id: string;
  name: string;
  cover_url?: string;
  created_at: string;
  results: any[];
}

export const YourPlaylists: React.FC = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPlaylists = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from("playlists")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(3); // Only get the 3 most recent playlists
        
        if (error) {
          console.error("Error fetching playlists for dashboard:", error);
          return;
        }
        
        setPlaylists(data || []);
      } catch (error) {
        console.error("Error in dashboard playlists fetch:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlaylists();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Your Playlists</h2>
          <Link to="/playlists" className="text-xs text-gold hover:underline">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PlaylistSkeleton count={3} />
        </div>
      </div>
    );
  }

  if (!loading && playlists.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Your Playlists</h2>
          <Link to="/playlists" className="text-xs text-gold hover:underline">
            View All
          </Link>
        </div>
        <div className="neo-card p-6 text-center">
          <p className="text-white/60">No playlists created yet.</p>
          <Link to="/music-finder" className="text-gold hover:underline mt-2 block">
            Create your first playlist
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Your Playlists</h2>
        <Link to="/playlists" className="text-xs text-gold hover:underline">
          View All
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {playlists.map((playlist) => (
          <Link 
            to={`/playlists/${playlist.id}`}
            key={playlist.id}
            className="block group"
          >
            <div className="neo-card overflow-hidden rounded-lg transition-all duration-300">
              <div className="aspect-square overflow-hidden">
                <img 
                  src={playlist.cover_url || "https://picsum.photos/seed/" + playlist.id + "/300"} 
                  alt={playlist.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 space-y-1">
                <h3 className="font-medium text-white group-hover:text-gold transition-colors">
                  {playlist.name}
                </h3>
                <div className="flex justify-between text-xs text-white/60">
                  <span>{Array.isArray(playlist.results) ? playlist.results.length : 0} tracks</span>
                  <span>{formatDistanceToNow(new Date(playlist.created_at), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
