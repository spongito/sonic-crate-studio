import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Info, Music, Save } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PlaylistViewerProps {
  playlistData?: any;
}

const PlaylistViewer = ({ playlistData }: PlaylistViewerProps) => {
  if (!playlistData || !playlistData.tracks) {
    return (
      <div className="glass-morphism rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gradient">Your Playlist</h2>
        <div className="text-center py-8 text-muted-foreground">
          <Music className="mx-auto h-12 w-12 opacity-50 mb-4" />
          <p>Generating your personalized playlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-morphism rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gradient">{playlistData.name || "Your Playlist"}</h2>
        <Button variant="outline" size="sm">
          <Save className="mr-2 h-4 w-4" />
          Save Playlist
        </Button>
      </div>

      <div className="rounded-lg overflow-hidden border border-white/10">
        <Table>
          <TableHeader>
            <TableRow className="bg-white/5 hover:bg-white/10">
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead>Track</TableHead>
              <TableHead>Artist</TableHead>
              <TableHead className="hidden md:table-cell">Album</TableHead>
              <TableHead className="w-16 text-center">Platform</TableHead>
              <TableHead className="w-16 text-center">Match</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {playlistData.tracks.map((track: any, index: number) => (
              <TableRow key={track.id} className="hover:bg-white/5">
                <TableCell className="font-medium text-center">{index + 1}</TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    {track.image ? (
                      <img 
                        src={track.image} 
                        alt={track.name} 
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                        <Music className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <span className="line-clamp-1">{track.name}</span>
                  </div>
                </TableCell>
                <TableCell className="line-clamp-1">{track.artist}</TableCell>
                <TableCell className="hidden md:table-cell line-clamp-1">{track.album || "-"}</TableCell>
                <TableCell className="text-center">
                  {track.platform === "spotify" ? (
                    <a href={track.external_url} target="_blank" rel="noreferrer">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        width="20" 
                        height="20" 
                        className="mx-auto text-green-500"
                      >
                        <path 
                          fill="currentColor" 
                          d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.701 1.32.36.179.48.659.24 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.479.12-1.02.66-1.2 3.6-1.141 10.561-.899 14.719 1.62.539.3.719.9.419 1.379-.299.48-.9.66-1.379.419z"
                        />
                      </svg>
                    </a>
                  ) : (
                    <Music className="h-5 w-5 mx-auto" />
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="relative flex items-center justify-center cursor-help">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-700 flex items-center justify-center">
                            <span className="text-xs font-medium">{track.score || "?"}</span>
                          </div>
                          <Info className="absolute bottom-0 right-0 h-3 w-3 text-white/70" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>{track.reasoning || "No explanation available"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {playlistData.tracks.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No tracks found for your query. Please try again with different parameters.</p>
        </div>
      )}
    </div>
  );
};

export default PlaylistViewer;
