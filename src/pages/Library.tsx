
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bug } from "lucide-react";

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
    console.log("Filters updated:", JSON.stringify(filters));
  }, [filters]);

  const { tracks: allTracks, isLoading, toggleLike, error } = useUserLikedTracks({
    filters,
    userId: user?.id || ""
  });

  // Log any errors
  useEffect(() => {
    if (error) {
      console.error("Library: Error loading tracks:", error);
    }
  }, [error]);

  const handleLikeToggle = async (trackId: string, currentlyLiked: boolean) => {
    try {
      console.log(`Library: Toggling like for track ${trackId}, currently liked: ${currentlyLiked}`);
      await toggleLike({ trackId, liked: currentlyLiked });
      toast.success(currentlyLiked ? "Track removed from likes" : "Track added to likes");
    } catch (error) {
      console.error("Error toggling track like:", error);
      toast.error("Failed to update track like status");
    }
  };

  const memoTracks = useMemo(() => {
    console.log(`Library: Processing ${allTracks.length} tracks`);
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
    if (!memoTracks.length) {
      console.info("RecentlyFoundTracks: No tracks available to display");
      return [];
    }
    
    const sortedTracks = [...memoTracks].sort((a, b) => {
      if (!a.created_at) return 1;
      if (!b.created_at) return -1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    
    const recentOnes = sortedTracks.slice(0, 10);
    console.log(`Library: Found ${recentOnes.length} recent tracks`);
    return recentOnes;
  }, [memoTracks]);

  // Debug component
  const DebugPanel = () => (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="text-xs font-mono overflow-auto max-h-[300px]">
        <div>
          <strong>User ID:</strong> {user?.id || 'Not logged in'}
        </div>
        <div>
          <strong>Filter State:</strong>
          <pre>{JSON.stringify(filters, null, 2)}</pre>
        </div>
        <div>
          <strong>Tracks Loaded:</strong> {memoTracks.length}
        </div>
        <div>
          <strong>Recent Tracks:</strong> {recentTracks.length}
        </div>
        <div>
          <strong>Error:</strong> {error ? JSON.stringify(error) : 'None'}
        </div>
        <div>
          <strong>Active Tab:</strong> {activeTab}
        </div>
      </CardContent>
    </Card>
  );

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

        {showDebug && <DebugPanel />}

        <div className="flex flex-col gap-8">
          <RecentlyFoundTracks tracks={recentTracks} onLikeToggle={handleLikeToggle} />

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
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Library;
