
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface PlaylistCardProps {
  id: string;
  title: string;
  coverUrl: string;
  trackCount: number;
  createdAt: string;
}

export function PlaylistCard({ id, title, coverUrl, trackCount, createdAt }: PlaylistCardProps) {
  return (
    <Link to={`/playlists/${id}`}>
      <Card className="neo-card overflow-hidden group transition-all duration-300 hover:scale-[1.02]">
        <AspectRatio ratio={1} className="bg-muted">
          <img 
            src={coverUrl || "placeholder.svg"} 
            alt={title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
        </AspectRatio>
        <CardHeader className="p-4">
          <CardTitle className="text-lg font-semibold tracking-tight group-hover:text-gold transition-colors">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{trackCount} tracks</span>
            <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
