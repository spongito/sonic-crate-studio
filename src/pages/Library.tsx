
import { useState } from "react";
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

  const { tracks: allTracks, isLoading, toggleLike } = useUserLikedTracks({
    filters,
    userId: user?.id || ""
  });

  const handleLikeToggle = async (trackId: string, currentlyLiked: boolean) => {
    try {
      await toggleLike({ trackId, liked: currentlyLiked });
      toast.success(currentlyLiked ? "Track removed from likes" : "Track added to likes");
    } catch (error) {
      toast.error("Failed to update track like status");
      console.error("Error toggling track like:", error);
    }
  };

  const memoTracks = useMemo(() => allTracks.map((t) => ({
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
    liked: t.liked
  })), [allTracks]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          Loading...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col gap-8">
          <RecentlyFoundTracks tracks={memoTracks.slice(0, 10)} onLikeToggle={handleLikeToggle} />

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
