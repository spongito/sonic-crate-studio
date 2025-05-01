import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { RecentlyFoundTracks } from "@/components/Library/RecentlyFoundTracks";
import { LibraryContent } from "@/components/Library/LibraryContent";
import { DebugPanel } from "@/components/Library/DebugPanel";
import { LibraryTabs } from "@/components/Library/LibraryTabs";
import { DebugButton } from "@/components/Library/DebugButton";
import { LoadingState } from "@/components/Library/LoadingState";
import { EmptyLibraryState } from "@/components/Library/EmptyLibraryState";
import { ErrorState } from "@/components/Library/ErrorState";
import { LibraryActions } from "@/components/Library/LibraryActions";
import { useLogger } from "@/hooks/useLogger";
import { useTracks } from "@/context/TracksContext";
import { useLibraryFilters } from "@/hooks/useLibraryFilters";
import { toast } from "sonner";

export function LibraryMain() {
  const { user } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("all");
  const [showDebug, setShowDebug] = useState(false);
  const logger = useLogger("Library");
  const { 
    allTracks, 
    recentTracks, 
    isLoading, 
    error, 
    refreshTracks,
    isSyncing,
    syncExistingPlaylists,
    toggleLike
  } = useTracks();
  const initialLoadCompleted = useRef(false);
  
  // Use our extracted filter hook
  const {
    showFilters,
    setShowFilters,
    search,
    setSearch,
    dateRange,
    setDateRange,
    bpmRange,
    setBpmRange,
    yearRange,
    setYearRange,
    genre,
    setGenre,
    keySignature,
    setKeySignature,
    filteredTracks,
    filteredLikedTracks,
    filters
  } = useLibraryFilters(allTracks);

  // Effect to handle tab change from query parameter
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

  const handleLikeToggle = async (trackId: string, liked: boolean) => {
    if (!user) {
      toast.error("Please sign in to save tracks");
      return;
    }
    
    try {
      // Note: toggleLike expects the current state, not the new desired state
      // liked = true means "currently liked", so we pass that to toggleLike
      await toggleLike(trackId, liked);
      toast.success(liked ? "Removed from your favorites" : "Added to your favorites");
    } catch (error) {
      logger.error("Error toggling like:", error);
      toast.error("Failed to update liked status");
    }
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
    return <EmptyLibraryState onSyncClick={handleSyncClick} />;
  }

  // Display error state with retry button
  if (error && allTracks.length === 0) {
    return <ErrorState error={error} onRetry={handleRefreshClick} onSync={handleSyncClick} />;
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
        <LibraryActions onRefresh={handleRefreshClick} onSync={handleSyncClick} />

        <RecentlyFoundTracks 
          tracks={recentTracks} 
          onLikeToggle={handleLikeToggle} 
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

        <LibraryContent
          activeTab={activeTab}
          tracks={activeTab === 'liked' ? filteredLikedTracks : filteredTracks}
          onLikeToggle={handleLikeToggle}
        />
      </div>
    </div>
  );
}
