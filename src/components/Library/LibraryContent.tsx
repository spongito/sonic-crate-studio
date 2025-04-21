
import { GeneratedPlaylistTable } from "@/components/GeneratedPlaylistTable";
import { TabsContent } from "@/components/ui/tabs";
import type { Track } from "@/types/table";

interface LibraryContentProps {
  activeTab: string;
  tracks: Track[];
  onLikeToggle: (trackId: string, liked: boolean) => void;
}

export function LibraryContent({ activeTab, tracks, onLikeToggle }: LibraryContentProps) {
  return (
    <>
      <TabsContent value="all" className="space-y-4">
        <GeneratedPlaylistTable
          tracks={tracks}
          showControls={false}
          fullWidth={true}
          onLikeChange={(trackId, liked) => onLikeToggle(trackId, liked)}
        />
      </TabsContent>

      <TabsContent value="liked" className="space-y-4">
        <GeneratedPlaylistTable
          tracks={tracks.filter(track => track.liked)}
          showControls={false}
          fullWidth={true}
          onLikeChange={(trackId, liked) => onLikeToggle(trackId, liked)}
        />
      </TabsContent>
    </>
  );
}
