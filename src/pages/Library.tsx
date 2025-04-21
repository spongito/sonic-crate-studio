
import { useState } from "react";
import { useUserLikedTracks } from "@/hooks/useUserLikedTracks";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { RecentlyFoundTracks } from "@/components/Library/RecentlyFoundTracks";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMemo } from "react";
import { LibrarySearch } from "@/components/Library/LibrarySearch";
import { LibraryContent } from "@/components/Library/LibraryContent";

const Library = () => {
  const { user } = useAuth();
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [camelotMode, setCamelotMode] = useState(false);

  // Filters state
  const [bpmMin, setBpmMin] = useState("");
  const [bpmMax, setBpmMax] = useState("");
  const [yearMin, setYearMin] = useState("");
  const [yearMax, setYearMax] = useState("");
  const [genre, setGenre] = useState<string[]>([]);
  const [key, setKey] = useState("");
  const [energy, setEnergy] = useState<string[]>([]);
  const [mood, setMood] = useState<string[]>([]);

  const filters = {
    search, bpmMin, bpmMax, yearMin, yearMax, genre, key, energy, mood, camelotMode
  };

  const { tracks: likedTracks, isLoading: isLoadingLiked } = useUserLikedTracks({
    filters,
    userId: user?.id || ""
  });

  // All liked track IDs for like state management in table
  const trackIds = (Array.isArray(likedTracks) ? likedTracks : []).map(t => t.id);

  // List as required by shared table
  const memoTracks = useMemo(() => (
    (Array.isArray(likedTracks) ? likedTracks : []).map((t) => ({
      ...t,
      platform: "spotify",
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
    }))
  ), [likedTracks]);

  if (isLoadingLiked) {
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
          <RecentlyFoundTracks />

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
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

            <LibraryContent
              activeTab={activeTab}
              tracks={memoTracks}
              trackIds={trackIds}
            />
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Library;
