
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Download } from "lucide-react";

interface Track {
  title: string;
  artist: string;
  duration: string;
}

interface PlaylistProps {
  id: string;
  title: string;
  description: string;
  tracks: Track[];
  isPremium?: boolean;
}

// Example playlist for demo purposes
const demoPlaylist: PlaylistProps = {
  id: "1",
  title: "Soulful Afrobeat for Golden Hour",
  description: "A curated selection of mellow afrobeat tracks perfect for sunset vibes",
  tracks: [
    { title: "Ye", artist: "Burna Boy", duration: "3:42" },
    { title: "Essence", artist: "WizKid ft. Tems", duration: "4:09" },
    { title: "Soco", artist: "Starboy ft. Wizkid, Terri, Spotless & Ceeza Milli", duration: "4:23" },
    { title: "Gbona", artist: "Burna Boy", duration: "3:01" },
    { title: "Anybody", artist: "Burna Boy", duration: "2:58" },
    { title: "Dumebi", artist: "Rema", duration: "3:29" },
    { title: "Dangote", artist: "Burna Boy", duration: "3:45" },
    { title: "Calm Down", artist: "Rema", duration: "3:40" },
    { title: "On The Low", artist: "Burna Boy", duration: "3:18" },
    { title: "Location", artist: "Dave ft. Burna Boy", duration: "3:45" }
  ]
};

const PlaylistViewer = ({ playlist = demoPlaylist }: { playlist?: PlaylistProps }) => {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const handleExport = () => {
    setIsExportModalOpen(true);
    // In a real app, this would open a modal with export options
    console.log("Export requested for playlist:", playlist.id);
  };

  const handleShare = () => {
    console.log("Share requested for playlist:", playlist.id);
    // In a real app, this would open a share dialog
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">{playlist.title}</CardTitle>
        <CardDescription>{playlist.description}</CardDescription>
        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button 
            size="sm" 
            className={playlist.isPremium ? "bg-gold hover:bg-gold-dark text-black" : ""} 
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
            {playlist.isPremium && <span className="ml-1 text-xs">(Pro)</span>}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left p-3">#</th>
                <th className="text-left p-3">Title</th>
                <th className="text-left p-3">Artist</th>
                <th className="text-left p-3">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {playlist.tracks.map((track, index) => (
                <tr key={index} className="hover:bg-secondary/20 transition-colors">
                  <td className="p-3 text-muted-foreground">{index + 1}</td>
                  <td className="p-3">{track.title}</td>
                  <td className="p-3 text-muted-foreground">{track.artist}</td>
                  <td className="p-3 text-muted-foreground">{track.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlaylistViewer;
