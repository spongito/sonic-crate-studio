import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlatformSelectSection } from "../MusicFinder/AdvancedSettings/PlatformSelectSection";
import { GenreSelect } from "../MusicFinder/AdvancedSettings/GenreSelect";
import { LocationSelectSection } from "../MusicFinder/AdvancedSettings/LocationSelectSection";
import { CommercialSlider } from "../MusicFinder/AdvancedSettings/CommercialSlider";
import { ReleaseYearRangeSlider } from "../MusicFinder/AdvancedSettings/ReleaseYearRangeSlider";
import { BpmFilter } from "../MusicFinder/AdvancedSettings/BpmFilter";
import { ReferenceSearch, type SpotifySearchResult } from "../MusicFinder/ReferenceSearch";
import { getDefaultPlatforms, type Platform } from "../MusicFinder/PlatformSelector";
import { Input } from "@/components/ui/input";
import { AdvancedFilterToggle } from "../MusicFinder/AdvancedSettings/AdvancedFilterToggle";

const genres = [
  "Afrobeat", "Ambient", "Blues", "Classical", "Deep House", 
  "Disco", "Drum & Bass", "Funk", "Hip-Hop", "House", 
  "Jazz", "Lo-fi", "Minimal", "Pop", "Progressive", 
  "R&B", "Reggae", "Rock", "Soul", "Tech House", "Techno", "Trance"
];

const locations = [
  { value: "US", label: "United States" },
  { value: "UK", label: "United Kingdom" },
  { value: "NG", label: "Nigeria" },
  { value: "JM", label: "Jamaica" },
  { value: "TT", label: "Trinidad & Tobago" },
  { value: "global", label: "Global" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "JP", label: "Japan" },
  { value: "BR", label: "Brazil" },
  { value: "ZA", label: "South Africa" },
];

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPrompt?: string;
  onSubmit: (params: SearchParams) => void;
}

export interface SearchParams {
  prompt: string;
  mode?: string;
  genre: string;
  length: string;
  commercialFactor: number;
  description?: string;
  platforms: Platform[];
  referenceArtistIds?: string[];
  referenceTrackIds?: string[];
  locations: string[];
  releaseYearRange: [number, number];
  bpmRange?: [number, number];
  useBpmFilter: boolean;
  activeFilters: {
    genre: boolean;
    location: boolean;
    releaseYear: boolean;
    commercial: boolean;
    references: boolean;
    bpm: boolean;
  };
}

export function SearchDialog({ open, onOpenChange, initialPrompt = "", onSubmit }: SearchDialogProps) {
  const [params, setParams] = useState<SearchParams>({
    prompt: initialPrompt,
    genre: "",
    length: "1.5h", // default length, not exposed to UI
    commercialFactor: 50,
    platforms: getDefaultPlatforms(),
    releaseYearRange: [1990, 2025],
    useBpmFilter: false,
    locations: ["global"],
    activeFilters: {
      genre: true,
      location: true,
      releaseYear: true,
      commercial: true,
      references: true,
      bpm: true
    }
  });
  
  const [selectedReferences, setSelectedReferences] = useState<SpotifySearchResult[]>([]);

  useEffect(() => {
    if (initialPrompt) {
      setParams(prev => ({ ...prev, prompt: initialPrompt }));
    }
  }, [initialPrompt]);

  const handlePlatformsChange = (newPlatforms: Platform[]) => {
    setParams(prev => ({ ...prev, platforms: newPlatforms }));
  };

  const updateActiveFilters = (filter: keyof SearchParams['activeFilters'], value: boolean) => {
    setParams(prev => ({
      ...prev,
      activeFilters: {
        ...prev.activeFilters,
        [filter]: value
      }
    }));
  };

  const handleReferencesChange = (references: SpotifySearchResult[]) => {
    setSelectedReferences(references);
    const artistIds = references
      .filter(ref => ref.type === 'artist')
      .map(ref => ref.id);

    const trackIds = references
      .filter(ref => ref.type === 'track')
      .map(ref => ref.id);

    setParams(prev => ({ 
      ...prev,
      referenceArtistIds: artistIds.length > 0 ? artistIds : undefined,
      referenceTrackIds: trackIds.length > 0 ? trackIds : undefined
    }));
  };

  const addLocation = (locationValue: string) => {
    if (!params.locations.includes(locationValue)) {
      setParams(prev => ({ 
        ...prev,
        locations: [...prev.locations, locationValue] 
      }));
    }
  };

  const removeLocation = (locationValue: string) => {
    setParams(prev => ({
      ...prev,
      locations: prev.locations.filter(loc => loc !== locationValue)
    }));
  };

  const handleSubmit = () => {
    onSubmit(params);
    onOpenChange(false);
  };
  
  const spotifyEnabled = params.platforms.find(p => p.id === 'spotify')?.enabled;

  // Helper: Section header with title and toggle
  const FilterSectionHeader = ({
    label,
    filterKey,
    checked,
    onCheckedChange,
    extraClass = ""
  }: {
    label: string;
    filterKey: keyof SearchParams['activeFilters'];
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    extraClass?: string;
  }) => (
    <div className={`flex items-center justify-between py-1 ${extraClass}`}>
      <span className="text-sm font-medium flex-1">{label}</span>
      <AdvancedFilterToggle
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Advanced Search Options</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 my-4">
          <Input
            placeholder="What kind of music are you looking for?"
            value={params.prompt}
            onChange={(e) => setParams({ ...params, prompt: e.target.value })}
            className="w-full"
          />
          <div className="space-y-6 mt-2">

            {/* Platform selection always shown */}
            <PlatformSelectSection
              platforms={params.platforms}
              onChange={handlePlatformsChange}
            />

            {/* Reference Artists & Tracks */}
            <div className="space-y-2">
              <FilterSectionHeader
                label="Reference Artists & Tracks"
                filterKey="references"
                checked={params.activeFilters.references}
                onCheckedChange={val => updateActiveFilters('references', val)}
              />
              {params.activeFilters.references && (
                <ReferenceSearch
                  selectedReferences={selectedReferences}
                  onReferencesChange={handleReferencesChange}
                  disabled={!spotifyEnabled}
                  placeholder={
                    spotifyEnabled
                      ? "Search for artists or tracks..."
                      : "Enable Spotify to use references"
                  }
                  hideLabel={true}
                />
              )}
            </div>

            {/* Commercial Factor => Commercial Balance */}
            <div className="space-y-2">
              <FilterSectionHeader
                label="Commercial Balance"
                filterKey="commercial"
                checked={params.activeFilters.commercial}
                onCheckedChange={val => updateActiveFilters('commercial', val)}
              />
              {params.activeFilters.commercial && (
                <CommercialSlider
                  value={params.commercialFactor}
                  onChange={value => setParams({ ...params, commercialFactor: value })}
                />
              )}
            </div>

            {/* Release Date Range */}
            <div className="space-y-2">
              <FilterSectionHeader
                label="Release Date Range"
                filterKey="releaseYear"
                checked={params.activeFilters.releaseYear}
                onCheckedChange={val => updateActiveFilters('releaseYear', val)}
              />
              {params.activeFilters.releaseYear && (
                <ReleaseYearRangeSlider
                  value={params.releaseYearRange}
                  onChange={val => setParams({ ...params, releaseYearRange: val })}
                  min={1990}
                  max={2025}
                />
              )}
            </div>

            {/* Genres */}
            <div className="space-y-2">
              <FilterSectionHeader
                label="Genres"
                filterKey="genre"
                checked={params.activeFilters.genre}
                onCheckedChange={val => updateActiveFilters('genre', val)}
              />
              {params.activeFilters.genre && (
                <GenreSelect 
                  value={params.genre} 
                  onChange={v => setParams({ ...params, genre: v })} 
                  genres={genres}
                />
              )}
            </div>

            {/* Locations */}
            <div className="space-y-2">
              <FilterSectionHeader
                label="Locations"
                filterKey="location"
                checked={params.activeFilters.location}
                onCheckedChange={val => updateActiveFilters('location', val)}
              />
              {params.activeFilters.location && (
                <LocationSelectSection
                  locations={locations}
                  selected={params.locations}
                  onAdd={addLocation}
                  onRemove={removeLocation}
                />
              )}
            </div>

            {/* BPM Range */}
            <div className="space-y-2">
              <FilterSectionHeader
                label="BPM Range"
                filterKey="bpm"
                checked={params.activeFilters.bpm}
                onCheckedChange={val => updateActiveFilters('bpm', val)}
              />
              {params.activeFilters.bpm && (
                <BpmFilter
                  bpmRange={params.bpmRange}
                  onChange={bpmRange =>
                    setParams({
                      ...params,
                      bpmRange
                    })
                  }
                  disabled={!spotifyEnabled}
                />
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Find Music</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
