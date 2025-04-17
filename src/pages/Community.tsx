
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Share2, Heart, Music, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface PlaylistCard {
  id: string;
  title: string;
  creator: string;
  likes: number;
  tracks: number;
  genres: string[];
  mood: string;
}

const samplePlaylists: PlaylistCard[] = [
  {
    id: "1",
    title: "Soulful Afrobeat Sunset",
    creator: "DJMike",
    likes: 342,
    tracks: 14,
    genres: ["Afrobeat", "Soul"],
    mood: "Chill"
  },
  {
    id: "2",
    title: "Electronic Focus Mode",
    creator: "TechnoTara",
    likes: 218,
    tracks: 20,
    genres: ["Electronic", "Ambient"],
    mood: "Focus"
  },
  {
    id: "3",
    title: "Jazz Café Morning",
    creator: "JazzMatters",
    likes: 156,
    tracks: 12,
    genres: ["Jazz", "Lofi"],
    mood: "Relaxed"
  },
  {
    id: "4", 
    title: "High Energy Workout",
    creator: "FitBeats",
    likes: 489,
    tracks: 18,
    genres: ["EDM", "House"],
    mood: "Energetic"
  },
  {
    id: "5",
    title: "Classic Hip-Hop Journey",
    creator: "BoomBapKing",
    likes: 267,
    tracks: 22,
    genres: ["Hip-Hop", "Rap"],
    mood: "Nostalgic"
  },
  {
    id: "6",
    title: "Indie Discoveries",
    creator: "AlternativeMind",
    likes: 183,
    tracks: 15,
    genres: ["Indie", "Alternative"],
    mood: "Relaxed"
  }
];

const Community = () => {
  const [filterMood, setFilterMood] = useState<string | null>(null);
  const [filterGenre, setFilterGenre] = useState<string | null>(null);
  
  const allGenres = Array.from(
    new Set(samplePlaylists.flatMap(playlist => playlist.genres))
  ).sort();
  
  const allMoods = Array.from(
    new Set(samplePlaylists.map(playlist => playlist.mood))
  ).sort();
  
  const filteredPlaylists = samplePlaylists.filter(playlist => {
    const matchesMood = !filterMood || playlist.mood === filterMood;
    const matchesGenre = !filterGenre || playlist.genres.includes(filterGenre);
    return matchesMood && matchesGenre;
  });

  const handleShare = (id: string) => {
    toast.success("Playlist link copied to clipboard!");
  };

  const handleLike = (id: string) => {
    toast.success("Playlist added to your favorites");
  };

  return (
    <DashboardLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Community Crates</h1>
            <p className="text-muted-foreground mt-2">
              Discover playlists created and shared by the community
            </p>
          </div>
          <Button className="bg-gold hover:bg-gold-dark text-black">
            <Music className="mr-2 h-4 w-4" />
            Submit Your Playlist
          </Button>
        </div>
        
        <div className="mb-6 flex flex-wrap gap-2">
          <div className="mr-2">
            <span className="text-sm font-medium">Filter by genre:</span>
          </div>
          {allGenres.map(genre => (
            <Badge 
              key={genre}
              className={`cursor-pointer ${
                filterGenre === genre 
                  ? 'bg-gold text-black hover:bg-gold-dark' 
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
              onClick={() => setFilterGenre(filterGenre === genre ? null : genre)}
            >
              {genre}
            </Badge>
          ))}
        </div>
        
        <div className="mb-8 flex flex-wrap gap-2">
          <div className="mr-2">
            <span className="text-sm font-medium">Filter by mood:</span>
          </div>
          {allMoods.map(mood => (
            <Badge 
              key={mood}
              variant="outline"
              className={`cursor-pointer ${
                filterMood === mood 
                  ? 'border-gold text-gold hover:bg-gold/10' 
                  : ''
              }`}
              onClick={() => setFilterMood(filterMood === mood ? null : mood)}
            >
              {mood}
            </Badge>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaylists.map((playlist) => (
            <Card key={playlist.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="line-clamp-1">{playlist.title}</CardTitle>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{playlist.creator}</span>
                  </div>
                  <span>{playlist.tracks} tracks</span>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex flex-wrap gap-2 mb-3">
                  {playlist.genres.map(genre => (
                    <Badge key={genre} variant="secondary">{genre}</Badge>
                  ))}
                  <Badge variant="outline">{playlist.mood}</Badge>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-0">
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex items-center"
                    onClick={() => handleLike(playlist.id)}
                  >
                    <Heart className="h-4 w-4 mr-1" />
                    <span>{playlist.likes}</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleShare(playlist.id)}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="ghost" size="sm">
                  View <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {filteredPlaylists.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No playlists match your current filters.</p>
            <Button 
              variant="link" 
              onClick={() => {
                setFilterGenre(null);
                setFilterMood(null);
              }}
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Community;
