
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { RecentlyFoundTracks } from "@/components/Library/RecentlyFoundTracks";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useMemo } from "react";
import { LibrarySearch } from "@/components/Library/LibrarySearch";
import { LibraryFilters } from "@/components/Library/LibraryFilters";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Bug } from "lucide-react";
import { DebugPanel } from "@/components/Library/DebugPanel";
import { PaginatedTrackList } from "@/components/Library/PaginatedTrackList";
import { useLogger } from "@/hooks/useLogger";
import { TracksProvider, useTracks } from "@/context/TracksContext";

const LibraryContent = () => {
  const { user } = useAuth();
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [bpmRange, setBpmRange] = useState<[number, number]>([90, 140]);
  const [yearRange, setYearRange] = useState<[number, number]>([1950, new Date().getFullYear()]);
  const [genre, setGenre] = useState("");
  const [keySignature, setKeySignature] = useState("");
  const [camelotMode, setCamelotMode] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const logger = useLogger("Library");
  const { allTracks, recentTracks, isLoading, toggleLike, error } = useTracks();

  // Create consolidated filters object
  const filters = {
    search,
    bpmMin: bpmRange[0].toString(),
    bpmMax: bpmRange[1].toString(),
    yearMin: yearRange[0].toString(),
    yearMax: yearRange[1].toString(),
    genre: genre ? [genre] : [],
    key: keySignature,
    energy: [],
    mood: [],
    camelotMode
  };

  // Debug log on filter changes
  useEffect(() => {
    logger.info("Filters updated:", JSON.stringify(filters));
  }, [filters, logger]);

  // Log any errors
  useEffect(() => {
    if (error) {
      logger.error("Error loading tracks:", error);
    }
  }, [error, logger]);

  const handleLikeToggle = async (trackId: string, currentlyLiked: boolean) => {
    try {
      logger.info(`Toggling like for track ${trackId}, currently liked: ${currentlyLiked}`);
      await toggleLike(trackId, currentlyLiked);
      toast.success(currentlyLiked ? "Track removed from likes" : "Track added to likes");
    } catch (error) {
      logger.error("Error toggling track like:", error);
      toast.error("Failed to update track like status");
    }
  };

  // Filter tracks based on current search criteria
  const filteredTracks = useMemo(() => {
    if (!allTracks.length) return [];
    
    logger.info(`Filtering ${allTracks.length} tracks`);
    let result = [...allTracks];
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(t => 
        (t.title?.toLowerCase() || "").includes(searchLower) ||
        (typeof t.artist === 'string' ? t.artist?.toLowerCase() || "" : 
          Array.isArray(t.artist) ? t.artist.join(", ").toLowerCase() : ""
        ).includes(searchLower)
      );
    }
    
    // Apply BPM range filter
    result = result.filter(t => 
      (!t.bpm || (t.bpm >= bpmRange[0] && t.bpm <= bpmRange[1]))
    );
    
    // Apply year range filter
    result = result.filter(t => 
      (!t.release_year || (t.release_year >= yearRange[0] && t.release_year <= yearRange[1]))
    );
    
    // Apply key signature filter if selected
    if (keySignature) {
      result = result.filter(t => t.key_signature === keySignature);
    }
    
    // Apply genre filter if selected
    if (genre) {
      result = result.filter(t => {
        if (!t.genre) return false;
        if (Array.isArray(t.genre)) return t.genre.includes(genre);
        return t.genre === genre;
      });
    }
    
    // Apply date range filter if selected
    if (dateRange.from) {
      const fromDate = dateRange.from.getTime();
      result = result.filter(t => {
        if (!t.created_at) return true;
        return new Date(t.created_at).getTime() >= fromDate;
      });
    }
    
    if (dateRange.to) {
      const toDate = dateRange.to.getTime();
      result = result.filter(t => {
        if (!t.created_at) return true;
        return new Date(t.created_at).getTime() <= toDate;
      });
    }
    
    logger.info(`Found ${result.length} tracks after filtering`);
    return result;
  }, [allTracks, search, bpmRange, yearRange, keySignature, genre, dateRange, logger]);

  // Get tracks for the active tab
  const activeTabTracks = useMemo(() => {
    if (activeTab === "liked") {
      return filteredTracks.filter(track => track.liked);
    }
    return filteredTracks;
  }, [filteredTracks, activeTab]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="w-full flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your tracks...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={() => setShowDebug(!showDebug)}
        >
          <Bug size={16} />
          {showDebug ? 'Hide Debug' : 'Show Debug'}
        </Button>
      </div>

      {showDebug && (
        <DebugPanel 
          userId={user?.id} 
          filters={filters} 
          activeTab={activeTab}
        />
      )}

      <div className="flex flex-col gap-8">
        <RecentlyFoundTracks 
          tracks={recentTracks} 
          onLikeToggle={handleLikeToggle} 
        />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <TabsList>
                <TabsTrigger value="all">All Tracks</TabsTrigger>
                <TabsTrigger value="liked">Liked</TabsTrigger>
              </TabsList>

              <LibrarySearch
                search={search}
                setSearch={setSearch}
                dateRange={dateRange}
                setDateRange={setDateRange}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
              />
            </div>

            <LibraryFilters
              showFilters={showFilters}
              bpmRange={bpmRange}
              onBpmChange={setBpmRange}
              yearRange={yearRange}
              onYearChange={setYearRange}
              genre={genre}
              onGenreChange={setGenre}
              keySignature={keySignature}
              onKeyChange={setKeySignature}
            />
          </div>

          <TabsContent value="all" className="space-y-4">
            <PaginatedTrackList 
              tracks={activeTabTracks}
              onLikeToggle={handleLikeToggle}
              pageSize={15}
            />
          </TabsContent>

          <TabsContent value="liked" className="space-y-4">
            <PaginatedTrackList 
              tracks={activeTabTracks}
              onLikeToggle={handleLikeToggle}
              pageSize={15}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const Library = () => {
  return (
    <DashboardLayout>
      <TracksProvider>
        <LibraryContent />
      </TracksProvider>
    </DashboardLayout>
  );
};

export default Library;
