
import { PaginatedTrackList } from "@/components/Library/PaginatedTrackList";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import type { Track } from "@/types/table";
import { useLogger } from "@/hooks/useLogger";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";

interface LibraryContentProps {
  activeTab: string;
  tracks: Track[];
  isLoading: boolean;
  isPreviousData: boolean;
  onLikeToggle: (trackId: string, liked: boolean) => void;
}

export function LibraryContent({ 
  activeTab, 
  tracks, 
  isLoading,
  isPreviousData,
  onLikeToggle 
}: LibraryContentProps) {
  const logger = useLogger("LibraryContent");
  
  // Use memoized values to prevent unnecessary re-renders
  const memoizedTracks = useMemo(() => tracks, [tracks]);
  const likedTracks = useMemo(() => memoizedTracks.filter(track => track.liked), [memoizedTracks]);
  
  logger.debug(`Rendering LibraryContent with tab: ${activeTab}, ${memoizedTracks.length} total tracks`);
  logger.debug(`Found ${likedTracks.length} liked tracks`);
  
  const displayTracks = activeTab === 'liked' ? likedTracks : memoizedTracks;
  
  return (
    <Tabs value={activeTab} className="transition-all duration-300">
      <TabsContent value="all" className="space-y-4 animate-fade-in">
        {isLoading && !isPreviousData ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="flex items-center gap-4 p-4">
                <Skeleton className="h-12 w-12 rounded-md" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <PaginatedTrackList
            tracks={displayTracks}
            onLikeToggle={onLikeToggle}
            pageSize={15}
            showLoading={isPreviousData}
          />
        )}
      </TabsContent>

      <TabsContent value="liked" className="space-y-4 animate-fade-in">
        {isLoading && !isPreviousData ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="flex items-center gap-4 p-4">
                <Skeleton className="h-12 w-12 rounded-md" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <PaginatedTrackList
            tracks={displayTracks}
            onLikeToggle={onLikeToggle}
            pageSize={15}
            showLoading={isPreviousData}
          />
        )}
      </TabsContent>
    </Tabs>
  );
}
