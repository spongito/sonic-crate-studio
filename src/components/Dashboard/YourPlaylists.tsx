
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { PlaylistSkeleton } from "@/components/Playlists/PlaylistSkeleton";
import { Json } from '@/integrations/supabase/types';
import { Check, Edit, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from "sonner";

interface Playlist {
  id: string;
  name: string;
  cover_image_url?: string;
  created_at: string;
  results: any[];
}

// Interface to match the actual data from Supabase
interface PlaylistFromDB {
  id: string;
  name: string;
  cover_image_url?: string;
  created_at: string;
  results: Json;
  description: string;
  genres: string[];
  is_public: boolean;
  prompt: string;
  settings: Json;
  tags: string[];
  updated_at: string;
  user_id: string;
}

export const YourPlaylists: React.FC = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState<string>('');

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
        
        // Transform the data to match our Playlist interface
        const transformedPlaylists: Playlist[] = (data as PlaylistFromDB[]).map(playlist => ({
          id: playlist.id,
          name: playlist.name,
          cover_image_url: playlist.cover_image_url,
          created_at: playlist.created_at,
          results: Array.isArray(playlist.results) ? playlist.results : 
                  typeof playlist.results === 'string' ? JSON.parse(playlist.results) : 
                  [],
        }));
        
        setPlaylists(transformedPlaylists);
      } catch (error) {
        console.error("Error in dashboard playlists fetch:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlaylists();
  }, [user]);

  const handleEditClick = (playlist: Playlist) => {
    setEditingPlaylistId(playlist.id);
    setEditedName(playlist.name);
  };

  const handleSaveClick = async (playlistId: string) => {
    if (!editedName.trim()) {
      toast.error("Playlist name cannot be empty");
      return;
    }

    try {
      const { error } = await supabase
        .from("playlists")
        .update({ name: editedName })
        .eq("id", playlistId)
        .eq("user_id", user?.id);

      if (error) {
        console.error("Error updating playlist name:", error);
        toast.error("Failed to update playlist name");
        return;
      }

      // Update local state
      setPlaylists(prevPlaylists => 
        prevPlaylists.map(playlist => 
          playlist.id === playlistId ? { ...playlist, name: editedName } : playlist
        )
      );

      toast.success("Playlist name updated successfully");
      setEditingPlaylistId(null);
    } catch (error) {
      console.error("Error in playlist name update:", error);
      toast.error("Something went wrong");
    }
  };

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
          <div key={playlist.id} className="block group">
            <div className="neo-card overflow-hidden rounded-lg transition-all duration-300">
              <Link to={`/playlists/${playlist.id}`} className="block">
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={playlist.cover_image_url || "https://picsum.photos/seed/" + playlist.id + "/300"} 
                    alt={playlist.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </Link>
              <div className="p-4 space-y-1">
                <div className="flex justify-between items-center">
                  {editingPlaylistId === playlist.id ? (
                    <div className="flex items-center gap-2 w-full">
                      <Input
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="h-8 text-sm"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSaveClick(playlist.id)}
                        className="h-8 p-0 w-8"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Link to={`/playlists/${playlist.id}`} className="block">
                        <h3 className="font-medium text-white group-hover:text-gold transition-colors">
                          {playlist.name}
                        </h3>
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditClick(playlist)}
                        className="h-8 p-0 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
                <div className="flex justify-between text-xs text-white/60">
                  <span>{Array.isArray(playlist.results) ? playlist.results.length : 0} tracks</span>
                  <span>{formatDistanceToNow(new Date(playlist.created_at), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
