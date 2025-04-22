
import { PaginatedTrackList } from "@/components/Library/PaginatedTrackList";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import type { Track } from "@/types/table";
import { useLogger } from "@/hooks/useLogger";

interface LibraryContentProps {
  activeTab: string;
  tracks: Track[];
  onLikeToggle: (trackId: string, liked: boolean) => void;
}

export function LibraryContent({ activeTab, tracks, onLikeToggle }: LibraryContentProps) {
  const logger = useLogger("LibraryContent");
  
  logger.debug(`Rendering LibraryContent with tab: ${activeTab}, ${tracks.length} total tracks`);
  
  const likedTracks = tracks.filter(track => track.liked);
  logger.debug(`Found ${likedTracks.length} liked tracks`);
  
  return (
    <Tabs value={activeTab}>
      <TabsContent value="all" className="space-y-4">
        <PaginatedTrackList
          tracks={tracks}
          onLikeToggle={onLikeToggle}
          pageSize={15}
        />
      </TabsContent>

      <TabsContent value="liked" className="space-y-4">
        <PaginatedTrackList
          tracks={likedTracks}
          onLikeToggle={onLikeToggle}
          pageSize={15}
        />
      </TabsContent>
    </Tabs>
  );
}
