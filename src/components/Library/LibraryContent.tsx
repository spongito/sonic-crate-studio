
import { PaginatedTrackList } from "@/components/Library/PaginatedTrackList";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import type { Track } from "@/types/table";
import { useLogger } from "@/hooks/useLogger";
import { useMemo } from "react";

interface LibraryContentProps {
  activeTab: string;
  tracks: Track[];
  onLikeToggle: (trackId: string, liked: boolean) => void;
}

export function LibraryContent({ activeTab, tracks, onLikeToggle }: LibraryContentProps) {
  const logger = useLogger("LibraryContent");
  
  // Use memoized values to prevent unnecessary re-renders
  const memoizedTracks = useMemo(() => tracks, [tracks]);
  const likedTracks = useMemo(() => memoizedTracks.filter(track => track.liked), [memoizedTracks]);
  
  logger.debug(`Rendering LibraryContent with tab: ${activeTab}, ${memoizedTracks.length} total tracks`);
  logger.debug(`Found ${likedTracks.length} liked tracks`);
  
  return (
    <Tabs value={activeTab} className="transition-all duration-200">
      <TabsContent value="all" className="space-y-4 animate-fade-in">
        <PaginatedTrackList
          tracks={memoizedTracks}
          onLikeToggle={onLikeToggle}
          pageSize={15}
        />
      </TabsContent>

      <TabsContent value="liked" className="space-y-4 animate-fade-in">
        <PaginatedTrackList
          tracks={likedTracks}
          onLikeToggle={onLikeToggle}
          pageSize={15}
        />
      </TabsContent>
    </Tabs>
  );
}
