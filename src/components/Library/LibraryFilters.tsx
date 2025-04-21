
import { BpmFilter } from "@/components/Dashboard/MusicFinder/AdvancedSettings/BpmFilter";
import { ReleaseYearRangeSlider } from "@/components/Dashboard/MusicFinder/AdvancedSettings/ReleaseYearRangeSlider";
import { GenreSelect } from "@/components/Dashboard/MusicFinder/AdvancedSettings/GenreSelect";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface LibraryFiltersProps {
  showFilters: boolean;
  bpmRange: [number, number];
  onBpmChange: (range: [number, number]) => void;
  yearRange: [number, number];
  onYearChange: (range: [number, number]) => void;
  genre: string;
  onGenreChange: (genre: string) => void;
  keySignature: string;
  onKeyChange: (key: string) => void;
}

const musicKeys = [
  "C", "Cm", "C#", "C#m", "D", "Dm", "D#", "D#m",
  "E", "Em", "F", "Fm", "F#", "F#m", "G", "Gm",
  "G#", "G#m", "A", "Am", "A#", "A#m", "B", "Bm"
];

const genres = [
  "House", "Techno", "Disco", "Hip Hop", "R&B", "Soul",
  "Jazz", "Latin", "Pop", "Rock", "Classical", "Country",
  "Folk", "Electronic", "Ambient", "World"
];

export function LibraryFilters({
  showFilters,
  bpmRange,
  onBpmChange,
  yearRange,
  onYearChange,
  genre,
  onGenreChange,
  keySignature,
  onKeyChange,
}: LibraryFiltersProps) {
  if (!showFilters) return null;

  return (
    <div className="space-y-6 p-4 bg-muted/20 rounded-lg border">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label className="mb-2 block">BPM Range</Label>
          <BpmFilter
            bpmRange={bpmRange}
            onChange={onBpmChange}
            disabled={false}
          />
        </div>

        <div>
          <Label className="mb-2 block">Release Year</Label>
          <ReleaseYearRangeSlider
            value={yearRange}
            onChange={onYearChange}
            min={1950}
            max={new Date().getFullYear()}
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label className="mb-2 block">Genre</Label>
          <GenreSelect
            value={genre}
            onChange={onGenreChange}
            genres={genres}
          />
        </div>

        <div>
          <Label className="mb-2 block">Key</Label>
          <RadioGroup
            value={keySignature}
            onValueChange={onKeyChange}
            className="grid grid-cols-4 gap-2"
          >
            {musicKeys.map((key) => (
              <div key={key} className="flex items-center space-x-2">
                <RadioGroupItem value={key} id={`key-${key}`} />
                <Label htmlFor={`key-${key}`}>{key}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}
