
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { RecentlyFoundTracks } from "@/components/Library/RecentlyFoundTracks";
import { LibraryContent } from "@/components/Library/LibraryContent";
import { DebugPanel } from "@/components/Library/DebugPanel";
import { LibraryTabs } from "@/components/Library/LibraryTabs";
import { DebugButton } from "@/components/Library/DebugButton";
import { LoadingState } from "@/components/Library/LoadingState";
import { useLogger } from "@/hooks/useLogger";
import { useTracks } from "@/context/TracksContext";
import { TracksProvider } from "@/context/TracksContext";

const LibraryView = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
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
  const { allTracks, recentTracks, likedTracks, isLoading, toggleLike, error, refreshTracks } = useTracks();

  // Effect to handle URL parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    
    if (tabParam === 'liked') {
      setActiveTab('liked');
    } else if (tabParam === 'all') {
      setActiveTab('all');
    }
  }, [location.search]);

  // Handle tab change and update URL
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    // Update URL without reloading the page
    const searchParams = new URLSearchParams();
    if (tab !== 'all') {
      searchParams.set('tab', tab);
    }
    
    const newSearch = searchParams.toString();
    const newPath = newSearch ? `${location.pathname}?${newSearch}` : location.pathname;
    navigate(newPath, { replace: true });
  };

  useEffect(() => {
    logger.info(`Library loaded with ${allTracks.length} tracks, ${likedTracks.length} liked`);
    
    // Force a refresh if we have no tracks but we're logged in
    if (user?.id && allTracks.length === 0 && !isLoading) {
      logger.info('No tracks found, triggering refresh');
      refreshTracks();
    }
  }, [user?.id, allTracks.length, likedTracks.length, isLoading, logger, refreshTracks]);

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

  if (isLoading) {
    return <LoadingState />;
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
          onTabChange={handleTabChange}
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

        <LibraryContent
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
