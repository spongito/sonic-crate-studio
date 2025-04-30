
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { PlaylistSkeleton } from "@/components/Playlists/PlaylistSkeleton";
import { Json } from '@/integrations/supabase/types';
import { Edit, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import { PlaylistEditModal } from "@/components/Playlists/PlaylistEditModal";

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
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
    setEditingPlaylist(playlist);
    setIsEditModalOpen(true);
  };

  const handleSaveEditedPlaylist = async (name: string, coverUrl: string) => {
    if (!editingPlaylist) return;
    
    try {
      const { error } = await supabase
        .from("playlists")
        .update({ 
          name: name,
          cover_image_url: coverUrl 
        })
        .eq("id", editingPlaylist.id)
        .eq("user_id", user?.id);

      if (error) {
        console.error("Error updating playlist:", error);
        toast.error("Failed to update playlist");
        return;
      }

      // Update local state
      setPlaylists(prevPlaylists => 
        prevPlaylists.map(playlist => 
          playlist.id === editingPlaylist.id 
            ? { ...playlist, name: name, cover_image_url: coverUrl } 
            : playlist
        )
      );

      toast.success("Playlist updated successfully");
      setIsEditModalOpen(false);
      setEditingPlaylist(null);
    } catch (error) {
      console.error("Error in playlist update:", error);
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
                  {playlist.cover_image_url ? (
                    <img 
                      src={playlist.cover_image_url} 
                      alt={playlist.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        // If image fails to load, use fallback
                        const target = e.target as HTMLImageElement;
                        target.src = `https://picsum.photos/seed/${playlist.id}/300`;
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-800 to-gray-900">
                      <Music className="h-1/3 w-1/3 text-gray-500" />
                    </div>
                  )}
                </div>
              </Link>
              <div className="p-4 space-y-1">
                <div className="flex justify-between items-center">
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

      {editingPlaylist && (
        <PlaylistEditModal
          isOpen={isEditModalOpen}
          playlistName={editingPlaylist.name}
          coverImageUrl={editingPlaylist.cover_image_url || ''}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingPlaylist(null);
          }}
          onSave={handleSaveEditedPlaylist}
        />
      )}
    </div>
  );
};
