
import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { RecentlyFoundTracks } from "@/components/Library/RecentlyFoundTracks";
import { LibraryContent as LibraryContentComponent } from "@/components/Library/LibraryContent";
import { DebugPanel } from "@/components/Library/DebugPanel";
import { LibraryTabs } from "@/components/Library/LibraryTabs";
import { DebugButton } from "@/components/Library/DebugButton";
import { LoadingState } from "@/components/Library/LoadingState";
import { useLogger } from "@/hooks/useLogger";
import { TracksProvider, useTracks } from "@/context/TracksContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Music, Search } from "lucide-react";

const LibraryView = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [bpmRange, setBpmRange] = useState<[number, number]>([90, 140]);
  const [yearRange, setYearRange] = useState<[number, number]>([1950, new Date().getFullYear()]);
  const [genre, setGenre] = useState("");
  const [keySignature, setKeySignature] = useState("");
  const [showDebug, setShowDebug] = useState(false);
  const logger = useLogger("Library");
  const { allTracks, recentTracks, isLoading, toggleLike, error, refreshTracks } = useTracks();
  const initialLoadCompleted = useRef(false);

  // New effect to handle tab change from query parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    
    if (tabParam === 'liked') {
      setActiveTab('liked');
    }
  }, [location.search]);

  // New effect to refresh tracks when the page is loaded - only once
  useEffect(() => {
    if (user && !initialLoadCompleted.current) {
      logger.info("Library page loaded, refreshing tracks once");
      refreshTracks().catch(err => {
        logger.error("Initial track refresh failed:", err);
        toast.error("Could not load your tracks. Please check your connection and try again.");
      });
      initialLoadCompleted.current = true;
    }
  }, [user, refreshTracks, logger]);

  // Show error message if there was a problem loading tracks
  useEffect(() => {
    if (error) {
      logger.error("Error in tracks loading:", error);
      
      // Check if it's a connection issue
      if (error.message?.includes("Failed to fetch") || error.message?.includes("Network")) {
        toast.error("Network connection issue. Please check your internet connection.");
      } else {
        toast.error("Error loading tracks. Please try again later.");
      }
    }
  }, [error, logger]);

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
    camelotMode: false
  };

  // Only show loading state on initial load, not on refreshes
  if (isLoading && allTracks.length === 0 && !initialLoadCompleted.current) {
    return <LoadingState />;
  }

  // New empty library state with guidance for new users
  if (!isLoading && allTracks.length === 0 && initialLoadCompleted.current) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-card border rounded-lg p-8 text-center max-w-2xl mx-auto shadow-sm">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Music className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold mb-2">Your Library is Empty</h2>
          <p className="text-muted-foreground mb-6">
            Start by discovering new tracks using the Music Finder to build your personal library. 
            Any tracks you find will appear here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/music-finder">
                <Search className="mr-2 h-4 w-4" />
                Find Music
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <DebugButton showDebug={showDebug} onToggle={() => setShowDebug(!showDebug)} />

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
          onLikeToggle={toggleLike} 
        />

        <LibraryTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          search={search}
          setSearch={setSearch}
          dateRange={dateRange}
          setDateRange={setDateRange}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          bpmRange={bpmRange}
          onBpmChange={setBpmRange}
          yearRange={yearRange}
          onYearChange={setYearRange}
          genre={genre}
          onGenreChange={setGenre}
          keySignature={keySignature}
          onKeyChange={setKeySignature}
        />

        <LibraryContentComponent
          activeTab={activeTab}
          tracks={allTracks}
          onLikeToggle={toggleLike}
        />
      </div>
    </div>
  );
};

const Library = () => {
  return (
    <DashboardLayout>
      <TracksProvider>
        <LibraryView />
      </TracksProvider>
    </DashboardLayout>
  );
};

export default Library;
