
import { PaginatedTrackList } from "@/components/Library/PaginatedTrackList";
import { TabsContent } from "@/components/ui/tabs";
import type { Track } from "@/types/table";
import { useLogger } from "@/hooks/useLogger";

interface LibraryContentProps {
  activeTab: string;
  tracks: Track[];
  onLikeToggle: (trackId: string, liked: boolean) => void;
}

export function LibraryContent({ activeTab, tracks, onLikeToggle }: LibraryContentProps) {
  const logger = useLogger("LibraryContent");
  
  logger.debug(`Rendering ${tracks.length} tracks for tab: ${activeTab}`);
  
  return (
    <>
      <TabsContent value="all" className="space-y-4">
        <PaginatedTrackList
          tracks={tracks}
          onLikeToggle={onLikeToggle}
          pageSize={15}
        />
      </TabsContent>

      <TabsContent value="liked" className="space-y-4">
        <PaginatedTrackList
          tracks={tracks.filter(track => track.liked)}
          onLikeToggle={onLikeToggle}
          pageSize={15}
        />
      </TabsContent>
    </>
  );
}
