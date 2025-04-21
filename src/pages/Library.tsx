
import { useState, useEffect } from "react";
import { useUserLikedTracks } from "@/hooks/useUserLikedTracks";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { RecentlyFoundTracks } from "@/components/Library/RecentlyFoundTracks";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMemo } from "react";
import { LibrarySearch } from "@/components/Library/LibrarySearch";
import { LibraryContent } from "@/components/Library/LibraryContent";
import { LibraryFilters } from "@/components/Library/LibraryFilters";
import { toast } from "sonner";
import { DebugPanel } from "@/components/Dashboard/MusicFinder/DebugPanel";
import { Bug } from "lucide-react";
import { Button } from "@/components/ui/button";

const Library = () => {
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
  const [debugLogs, setDebugLogs] = useState<string[]>([
    `Library page loaded at: ${new Date().toISOString()}`,
    `User ID: ${user?.id || 'Not logged in'}`,
  ]);

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

  // Log whenever filters change
  useEffect(() => {
    const logMessage = `Filters updated: ${JSON.stringify(filters)}`;
    console.log(logMessage);
    setDebugLogs(prev => [logMessage, ...prev]);
  }, [filters]);

  const { tracks: allTracks, isLoading, toggleLike } = useUserLikedTracks({
    filters,
    userId: user?.id || ""
  });

  const addDebugLog = (message: string) => {
    console.log(`Library: ${message}`);
    setDebugLogs(prev => [`${new Date().toLocaleTimeString()}: ${message}`, ...prev]);
  };

  useEffect(() => {
    addDebugLog(`Loaded ${allTracks.length} tracks from useUserLikedTracks`);
  }, [allTracks.length]);

  const handleLikeToggle = async (trackId: string, currentlyLiked: boolean) => {
    try {
      addDebugLog(`Toggling like for track ${trackId}, current state: ${currentlyLiked}`);
      await toggleLike({ trackId, liked: currentlyLiked });
      toast.success(currentlyLiked ? "Track removed from likes" : "Track added to likes");
    } catch (error) {
      addDebugLog(`Error toggling like for track ${trackId}: ${error}`);
      toast.error("Failed to update track like status");
      console.error("Error toggling track like:", error);
    }
  };

  const memoTracks = useMemo(() => {
    addDebugLog("Transforming tracks data");
    return allTracks.map((t) => ({
      ...t,
      platform: t.platform || "spotify",
      id: t.id,
      title: t.title,
      artist: t.artist,
      album: t.album,
      image_url: t.image_url,
      bpm: t.bpm,
      key_signature: t.key_signature,
      genre: t.genre,
      release_year: t.release_year,
      duration: t.duration,
      liked: t.liked,
      created_at: t.created_at
    }));
  }, [allTracks]);

  // Get recently found tracks - sort by created_at and take the most recent 10
  const recentTracks = useMemo(() => {
    addDebugLog("Sorting tracks by creation date");
    const sortedTracks = [...memoTracks].sort((a, b) => {
      if (!a.created_at) return 1;
      if (!b.created_at) return -1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    addDebugLog(`Found ${sortedTracks.length} sorted tracks, showing the 10 most recent`);
    return sortedTracks.slice(0, 10);
  }, [memoTracks]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="w-full flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your tracks...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col gap-8">
          <RecentlyFoundTracks tracks={recentTracks} onLikeToggle={handleLikeToggle} />

          <div className="flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowDebug(!showDebug)}
              className="flex items-center gap-2"
            >
              <Bug className="h-4 w-4" />
              {showDebug ? "Hide Debug Panel" : "Show Debug Panel"}
            </Button>
          </div>

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

            <LibraryContent
              activeTab={activeTab}
              tracks={memoTracks}
              onLikeToggle={handleLikeToggle}
            />
          </Tabs>
          
          {showDebug && (
            <DebugPanel
              showDebug={showDebug}
              onToggleDebug={setShowDebug}
              debugLogs={debugLogs}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Library;
