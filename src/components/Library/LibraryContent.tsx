
import { PaginatedTrackList } from "@/components/Library/PaginatedTrackList";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import type { Track } from "@/types/table";
import { useLogger } from "@/hooks/useLogger";
import { toast } from "sonner";

interface LibraryContentProps {
  activeTab: string;
  tracks: Track[];
  onLikeToggle: (trackId: string, liked: boolean) => void;
}

export function LibraryContent({ activeTab, tracks, onLikeToggle }: LibraryContentProps) {
  const logger = useLogger("LibraryContent");
  
  logger.debug(`Rendering ${tracks.length} filtered tracks for tab: ${activeTab}`);
  
  const handleLikeToggle = async (trackId: string, liked: boolean) => {
    try {
      await onLikeToggle(trackId, liked);
      // Toast is handled by the parent component
    } catch (error) {
      logger.error("Error toggling like status:", error);
      toast.error("Failed to update liked status");
    }
  };
  
  return (
    <Tabs value={activeTab}>
      <TabsContent value="all" className="space-y-4">
        <PaginatedTrackList
          tracks={tracks}
          onLikeToggle={handleLikeToggle}
          pageSize={15}
        />
      </TabsContent>

      <TabsContent value="liked" className="space-y-4">
        <PaginatedTrackList
          tracks={tracks}
          onLikeToggle={handleLikeToggle}
          pageSize={15}
        />
      </TabsContent>
    </Tabs>
  );
}
