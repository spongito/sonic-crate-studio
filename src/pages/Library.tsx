import { useState, useMemo, useCallback } from "react";
import { Heart, Search, ChevronDown } from "lucide-react";
import { useUserLikedTracks } from "@/hooks/useUserLikedTracks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { GeneratedPlaylistTable } from "@/components/GeneratedPlaylistTable";
import { useTrackLikes } from "@/hooks/useTrackLikes";
import { toast } from "sonner";

const Library = () => {
  const { user } = useAuth();
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");
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

  const { tracks, isLoading, error, refetch } = useUserLikedTracks({ 
    filters, 
    userId: user?.id || "" 
  });

  // Track likes hooks
  const { toggleLike, isProcessing } = useTrackLikes();

  // Handle track like changes
  const handleLikeChange = useCallback(async (trackId: string, liked: boolean) => {
    if (!liked) {
      // If track was unliked, refetch the library tracks
      await refetch();
    }
  }, [refetch]);

  // All liked track IDs for like state management in table
  const trackIds = (Array.isArray(tracks) ? tracks : []).map(t => t.id);

  // List as required by shared table
  const memoTracks = useMemo(() => (
    (Array.isArray(tracks) ? tracks : []).map((t) => ({
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
      liked: true // All tracks in library are liked by definition
    }))
  ), [tracks]);

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
          <h1 className="flex items-center gap-2 text-2xl sm:text-3xl font-bold text-white">
            <Heart className="text-gold w-7 h-7" /> Your Library
          </h1>
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            <Button
              variant={showFilters ? "secondary" : "outline"}
              className="min-w-[94px]"
              onClick={() => setShowFilters((v) => !v)}
            >
              Filters
              <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </Button>
            <Button variant="outline" className="hidden sm:inline-flex">
              Upload
            </Button>
          </div>
        </div>
        
        {/* Search and filters */}
        <div className="flex items-center justify-center mb-4">
          <div className="relative w-full sm:w-2/3">
            <Input
              type="search"
              placeholder="Search by track or artist..."
              className="pl-10"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
        
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 rounded-lg bg-white/5 border border-white/10">
            {/* BPM Range */}
            <div>
              <h3 className="text-sm font-medium text-white/70 mb-2">BPM Range</h3>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={bpmMin}
                  onChange={e => setBpmMin(e.target.value)}
                  className="w-full"
                />
                <span className="text-white/40">—</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={bpmMax}
                  onChange={e => setBpmMax(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Year Range */}
            <div>
              <h3 className="text-sm font-medium text-white/70 mb-2">Year Range</h3>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="From"
                  value={yearMin}
                  onChange={e => setYearMin(e.target.value)}
                  className="w-full"
                />
                <span className="text-white/40">—</span>
                <Input
                  type="number"
                  placeholder="To"
                  value={yearMax}
                  onChange={e => setYearMax(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Genre Filter */}
            <div>
              <h3 className="text-sm font-medium text-white/70 mb-2">Genre</h3>
              <MultiSelect
                options={genreOptions}
                value={genre}
                onChange={setGenre}
              />
            </div>

            {/* Key Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-white/70">Key</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCamelotMode(!camelotMode)}
                  className="h-6 text-xs"
                >
                  {camelotMode ? "Musical" : "Camelot"}
                </Button>
              </div>
              <select
                value={key}
                onChange={e => setKey(e.target.value)}
                className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white"
              >
                <option value="">Any Key</option>
                {(camelotMode ? camelotKeys : musicalKeys).map(k => (
                  <option key={k.value} value={k.value}>{k.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
        
        {/* TRACKS */}
        <div className="space-y-2">
          {isLoading ? (
            <div className="py-16 flex items-center justify-center text-white/80">Loading...</div>
          ) : error ? (
            <div className="py-16 text-center text-red-400">Error loading tracks: {error.message}</div>
          ) : (
            <GeneratedPlaylistTable
              tracks={memoTracks}
              userLikedTrackIds={trackIds}
              showControls={false}
              fullWidth={true}
              onLikeChange={handleLikeChange}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

// Placeholder MultiSelect component (replace with shadcn/ui Select in production)
function MultiSelect({ options, value, onChange }: { options: { label: string, value: string }[], value: string[], onChange: (v: string[]) => void }) {
  const toggle = (v: string) =>
    value.includes(v)
      ? onChange(value.filter(i => i !== v))
      : onChange([...value, v]);
  return (
    <div className="flex flex-wrap gap-1">
      {options.map(opt => (
        <button
          type="button"
          key={opt.value}
          className={`px-2 py-1 text-xs rounded border ${value.includes(opt.value) ? "bg-gold text-black border-gold" : "bg-white/10 text-white border-white/20"} transition`}
          onClick={() => toggle(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// Define genre/energy/mood/key options (partial, can be expanded)
const genreOptions = [
  { label: "House", value: "house" },
  { label: "Techno", value: "techno" },
  { label: "Hip-Hop", value: "hiphop" },
  // ...add more
];
const energyOptions = [
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];
const moodOptions = [
  { label: "Happy", value: "happy" },
  { label: "Energetic", value: "energetic" },
  { label: "Calm", value: "calm" },
];
const musicalKeys = [
  { label: "C Major", value: "C Major" }, { label: "G Major", value: "G Major" }, { label: "D Minor", value: "D Minor" },
  // ...add more
];
const camelotKeys = [
  { label: "8A", value: "8A" }, { label: "5B", value: "5B" }, { label: "9A", value: "9A" },
  // ...add more
];

export default Library;
