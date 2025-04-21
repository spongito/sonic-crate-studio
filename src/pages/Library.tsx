
import { useState } from "react";
import { Heart, Search, ChevronDown } from "lucide-react";
import { useUserLikedTracks } from "@/hooks/useUserLikedTracks";
import { TrackCard } from "@/components/TrackCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

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

  const { tracks, isLoading, error } = useUserLikedTracks({ 
    filters, 
    userId: user?.id || "" 
  });

  // Safety check for tracks
  const tracksList = Array.isArray(tracks) ? tracks : [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
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

      {/* Search bar */}
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

      {/* Filters box */}
      {showFilters && (
        <div className="rounded-lg bg-white/5 p-4 mb-6 space-y-4 border border-white/10">
          <div className="flex flex-col md:flex-row md:gap-4 space-y-3 md:space-y-0">
            {/* BPM */}
            <div>
              <label className="text-xs text-white/80">BPM Range</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  min={0}
                  className="w-20"
                  value={bpmMin}
                  onChange={e => setBpmMin(e.target.value)}
                />
                <span className="px-2 text-sm text-white/60">-</span>
                <Input
                  type="number"
                  placeholder="Max"
                  min={0}
                  className="w-20"
                  value={bpmMax}
                  onChange={e => setBpmMax(e.target.value)}
                />
              </div>
            </div>
            {/* Year */}
            <div>
              <label className="text-xs text-white/80">Year Range</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  min={1900}
                  className="w-20"
                  value={yearMin}
                  onChange={e => setYearMin(e.target.value)}
                />
                <span className="px-2 text-sm text-white/60">-</span>
                <Input
                  type="number"
                  placeholder="Max"
                  min={1900}
                  className="w-20"
                  value={yearMax}
                  onChange={e => setYearMax(e.target.value)}
                />
              </div>
            </div>
            {/* Key */}
            <div>
              <label className="text-xs text-white/80">Key</label>
              <select
                className="w-full p-2 rounded bg-background text-white border border-white/10"
                value={key}
                onChange={e => setKey(e.target.value)}
              >
                <option value="">Any</option>
                {camelotMode ? camelotKeys.map(k => (
                  <option key={k.value} value={k.value}>{k.label}</option>
                )) : musicalKeys.map(k => (
                  <option key={k.value} value={k.value}>{k.label}</option>
                ))}
              </select>
            </div>
            {/* Genre */}
            <div>
              <label className="text-xs text-white/80">Genre</label>
              <MultiSelect
                options={genreOptions}
                value={genre}
                onChange={setGenre}
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:gap-4 space-y-3 md:space-y-0">
            {/* Energy */}
            <div>
              <label className="text-xs text-white/80">Energy</label>
              <MultiSelect
                options={energyOptions}
                value={energy}
                onChange={setEnergy}
              />
            </div>
            {/* Mood */}
            <div>
              <label className="text-xs text-white/80">Mood</label>
              <MultiSelect
                options={moodOptions}
                value={mood}
                onChange={setMood}
              />
            </div>
            {/* Camelot Mode */}
            <div className="flex items-center space-x-2 mt-2">
              <input
                type="checkbox"
                id="camelot"
                checked={camelotMode}
                onChange={e => setCamelotMode(e.target.checked)}
                className="w-4 h-4 accent-gold"
              />
              <label htmlFor="camelot" className="text-xs text-white/80 cursor-pointer">Advanced (Camelot Mode)</label>
            </div>
          </div>
        </div>
      )}

      {/* TRACKS */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="py-16 flex items-center justify-center text-white/80">Loading...</div>
        ) : error ? (
          <div className="py-16 text-center text-red-400">Error loading tracks: {error.message}</div>
        ) : tracksList.length === 0 ? (
          <div className="py-16 text-center text-white/70">No tracks found. Like some tracks to see them here!</div>
        ) : (
          tracksList.map(track => (
            <TrackCard key={track.id} track={track} camelot={camelotMode} />
          ))
        )}
      </div>
    </div>
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
