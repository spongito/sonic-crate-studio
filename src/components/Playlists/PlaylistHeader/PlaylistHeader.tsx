
import { PlaylistCoverImage } from "./PlaylistCoverImage";
import { PlaylistInfo } from "./PlaylistInfo";

interface PlaylistHeaderProps {
  playlist: {
    id: string;
    name: string;
    description?: string | null;
    prompt?: string;
    created_at: string;
    genres?: string[];
  };
  tracks: any[];
  onEditClick: () => void;
  coverImageUrl?: string | null;
}

export function PlaylistHeader({ playlist, tracks, onEditClick, coverImageUrl }: PlaylistHeaderProps) {
  const firstTrackImage = tracks?.[0]?.image_url;
  const displayImage = coverImageUrl || firstTrackImage;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
      {/* Cover Image */}
      <PlaylistCoverImage
        playlistId={playlist.id}
        imageUrl={displayImage}
        name={playlist.name}
        onEditClick={onEditClick}
      />

      {/* Playlist Info */}
      <PlaylistInfo
        name={playlist.name}
        description={playlist.description}
        prompt={playlist.prompt}
        createdAt={playlist.created_at}
        tracksCount={tracks.length || 0}
        genres={playlist.genres}
      />
    </div>
  );
}
