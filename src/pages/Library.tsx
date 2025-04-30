
import { useState, useEffect, useRef, useMemo } from "react";
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
import { Music, Search, RefreshCw, LibraryBig, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Track } from "@/types/table";

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
  const { 
    allTracks, 
    recentTracks, 
    isLoading, 
    error, 
    refreshTracks,
    isSyncing,
    syncExistingPlaylists
  } = useTracks();
  const initialLoadCompleted = useRef(false);

  // New function to filter tracks based on search and other filters
  const filteredTracks = useMemo(() => {
    if (!allTracks || allTracks.length === 0) return [];
    
    let result = [...allTracks];
    
    // Filter by search term
    if (search && search.trim() !== '') {
      const searchLower = search.toLowerCase().trim();
      logger.debug(`Filtering tracks by search term: "${searchLower}"`);
      
      result = result.filter(track => {
        const titleMatch = track.title?.toLowerCase().includes(searchLower);
        const artistMatch = Array.isArray(track.artist) 
          ? track.artist.some(a => a.toLowerCase().includes(searchLower))
          : track.artist?.toLowerCase().includes(searchLower);
        const albumMatch = track.album?.toLowerCase().includes(searchLower);
        
        return titleMatch || artistMatch || albumMatch;
      });
      
      logger.debug(`Found ${result.length} tracks matching search term "${searchLower}"`);
    }
    
    // Filter by date range if specified
    if (dateRange.from || dateRange.to) {
      result = result.filter(track => {
        if (!track.created_at) return false;
        
        const trackDate = new Date(track.created_at);
        
        if (dateRange.from && trackDate < dateRange.from) return false;
        if (dateRange.to && trackDate > dateRange.to) return false;
        
        return true;
      });
    }
    
    // Filter by BPM range if specified
    if (bpmRange && bpmRange.length === 2) {
      result = result.filter(track => {
        if (!track.bpm) return true; // Keep tracks with no BPM info
        return track.bpm >= bpmRange[0] && track.bpm <= bpmRange[1];
      });
    }
    
    // Filter by year range if specified
    if (yearRange && yearRange.length === 2) {
      result = result.filter(track => {
        const year = track.release_year || track.year;
        if (!year) return true; // Keep tracks with no year info
        return year >= yearRange[0] && year <= yearRange[1];
      });
    }
    
    // Filter by genre if specified
    if (genre && genre !== '') {
      const genreLower = genre.toLowerCase();
      result = result.filter(track => {
        if (!track.genre) return false;
        
        if (Array.isArray(track.genre)) {
          return track.genre.some(g => g.toLowerCase().includes(genreLower));
        }
        
        return track.genre.toLowerCase().includes(genreLower);
      });
    }
    
    // Filter by key signature if specified
    if (keySignature && keySignature !== '') {
      result = result.filter(track => {
        if (!track.key_signature) return false;
        return track.key_signature.includes(keySignature);
      });
    }
    
    return result;
  }, [allTracks, search, dateRange, bpmRange, yearRange, genre, keySignature, logger]);

  // Add a separate useMemo for liked tracks that also applies our filters
  const filteredLikedTracks = useMemo(() => {
    return filteredTracks.filter(track => track.liked);
  }, [filteredTracks]);

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

  // Show syncing notification
  useEffect(() => {
    if (isSyncing) {
      toast.info("Syncing your playlist tracks to library. This might take a moment...", {
        duration: 5000
      });
    }
  }, [isSyncing]);

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

  const handleSyncClick = () => {
    if (!user) {
      toast.error("Please sign in to sync your library");
      return;
    }
    
    syncExistingPlaylists();
    toast.info("Syncing your playlists to library. Please wait...");
  };

  const handleRefreshClick = () => {
    if (!user) {
      toast.error("Please sign in to refresh your library");
      return;
    }
    
    toast.info("Refreshing library...");
    refreshTracks();
  };

  // Only show loading state on initial load, not on refreshes
  if ((isLoading && allTracks.length === 0 && !initialLoadCompleted.current) || isSyncing) {
    return (
      <LoadingState 
        message={isSyncing ? "Syncing your playlist tracks to the library..." : "Loading your library..."} 
      />
    );
  }

  // New empty library state with guidance for new users
  if (!isLoading && !isSyncing && allTracks.length === 0 && initialLoadCompleted.current) {
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
            <Button variant="outline" onClick={handleSyncClick}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync Existing Playlists
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Display error state with retry button
  if (error && allTracks.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center max-w-2xl mx-auto">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold mb-2">Error Loading Library</h2>
          <p className="text-muted-foreground mb-6">
            There was an error loading your music library: {error.message}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleRefreshClick}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Loading
            </Button>
            <Button variant="outline" onClick={handleSyncClick}>
              <LibraryBig className="mr-2 h-4 w-4" />
              Sync Library Manually
            </Button>
          </div>
        </Card>
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
        {/* Library Actions Bar */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Your Music Library</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefreshClick}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleSyncClick}>
              <LibraryBig className="mr-2 h-4 w-4" />
              Sync Playlists
            </Button>
          </div>
        </div>

        <RecentlyFoundTracks 
          tracks={recentTracks} 
          onLikeToggle={useTracks().toggleLike} 
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
          tracks={activeTab === 'liked' ? filteredLikedTracks : filteredTracks}
          onLikeToggle={useTracks().toggleLike}
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
