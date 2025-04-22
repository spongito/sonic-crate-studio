
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
import { TracksProvider, useTracks } from "@/context/TracksContext";
import { useLibraryTracks } from "@/hooks/useLibraryTracks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

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
  const { recentTracks, toggleLike } = useTracks();

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

  // Use the new React Query hook
  const filters = {
    search,
    bpmRange,
    yearRange,
    genre: genre || undefined,
    key: keySignature || undefined
  };
  
  const { 
    tracks, 
    isLoading,
    isPreviousData 
  } = useLibraryTracks({ 
    tab: activeTab, 
    filters 
  });

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
          tracks={recentTracks || []} 
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
          tracks={tracks}
          isLoading={isLoading}
          isPreviousData={isPreviousData}
          onLikeToggle={toggleLike}
        />
      </div>
    </div>
  );
};

const Library = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardLayout>
        <TracksProvider>
          <LibraryView />
        </TracksProvider>
      </DashboardLayout>
    </QueryClientProvider>
  );
};

export default Library;
