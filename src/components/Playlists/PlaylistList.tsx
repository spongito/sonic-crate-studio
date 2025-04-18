
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Playlist {
  id: string;
  name: string;
  prompt: string;
  description?: string;
  created_at: string;
  results: any[];
}

export function PlaylistList() {
  const { data: playlists, isLoading } = useQuery({
    queryKey: ["playlists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("playlists")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Playlist[];
    }
  });

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {playlists?.map((playlist) => (
        <Card key={playlist.id} className="neo-card group hover:border-gold/20 transition-colors">
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
  );
}
