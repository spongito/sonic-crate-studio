
import { GeneratedPlaylistTable } from "@/components/GeneratedPlaylistTable";
import { TabsContent } from "@/components/ui/tabs";

interface LibraryContentProps {
  activeTab: string;
  tracks: any[];
  trackIds: string[];
}

export function LibraryContent({ activeTab, tracks, trackIds }: LibraryContentProps) {
  return (
    <>
      <TabsContent value="all" className="space-y-4">
        <GeneratedPlaylistTable
          tracks={tracks}
          userLikedTrackIds={trackIds}
          showControls={false}
          fullWidth={true}
        />
      </TabsContent>

      <TabsContent value="liked" className="space-y-4">
        <GeneratedPlaylistTable
          tracks={tracks.filter(track => trackIds.includes(track.id))}
          userLikedTrackIds={trackIds}
          showControls={false}
          fullWidth={true}
        />
      </TabsContent>
    </>
  );
}
