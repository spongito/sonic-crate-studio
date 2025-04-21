import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useUserLikedTracks } from "@/hooks/useUserLikedTracks";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { GeneratedPlaylistTable } from "@/components/GeneratedPlaylistTable";
import { RecentlyFoundTracks } from "@/components/Library/RecentlyFoundTracks";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CalendarIcon, SlidersHorizontal } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Heart, Search, ChevronDown } from "lucide-react";
import { useMemo } from "react";

// Required track type
type TrackRow = {
  id: string;
  title: string;
  artist: string[];
  album: string;
  image_url: string | null;
  bpm: number | null;
  key_signature: string | null;
  genre: string[] | null;
  release_year: number | null;
  duration?: number;
  // Additional metadata can go here
};

type FilterState = {
  search: string;
  bpmMin: string;
  bpmMax: string;
  yearMin: string;
  yearMax: string;
  genre: string[];
  key: string;
  energy: string[];
  mood: string[];
  camelotMode: boolean;
};

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

  const { tracks: likedTracks, isLoading: isLoadingLiked, error } = useUserLikedTracks({
    filters,
    userId: user?.id || ""
  });

  // All liked track IDs for like state management in table
  const trackIds = (Array.isArray(likedTracks) ? likedTracks : []).map(t => t.id);

  // List as required by shared table
  const memoTracks = useMemo(() => (
    (Array.isArray(likedTracks) ? likedTracks : []).map((t) => ({
      ...t,
      platform: "spotify", // TODO: Map to real value if available
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

              <div className="flex gap-2 w-full sm:w-auto">
                <Input
                  placeholder="Search tracks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:w-[300px]"
                />
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[140px]">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        format(dateRange.from, "LLL dd, y")
                      ) : (
                        "Pick a date"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange.from}
                      selected={{ from: dateRange.from, to: dateRange.to }}
                      onSelect={(range: any) => setDateRange(range)}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>

                <Button
                  variant={showFilters ? "secondary" : "outline"}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <TabsContent value="all" className="space-y-4">
              <GeneratedPlaylistTable
                tracks={memoTracks}
                userLikedTrackIds={trackIds}
                showControls={false}
                fullWidth={true}
              />
            </TabsContent>

            <TabsContent value="liked" className="space-y-4">
              <GeneratedPlaylistTable
                tracks={memoTracks.filter(track => trackIds.includes(track.id))}
                userLikedTrackIds={trackIds}
                showControls={false}
                fullWidth={true}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Library;
