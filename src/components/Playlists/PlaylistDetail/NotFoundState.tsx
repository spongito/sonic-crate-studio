
import { Button } from "@/components/ui/button";

export function NotFoundState() {
  return (
    <div className="max-w-lg mx-auto text-center">
      <h1 className="text-3xl font-bold mb-4 text-white">Playlist Not Found</h1>
      <p className="text-lg text-muted-foreground mb-8">
        This playlist doesn't exist or has been removed.
      </p>
      <Button asChild>
        <a href="/playlists">Back to Playlists</a>
      </Button>
    </div>
  );
}
