
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlatformSelectSection } from "../MusicFinder/AdvancedSettings/PlatformSelectSection";
import { GenreSelect } from "../MusicFinder/AdvancedSettings/GenreSelect";
import { LocationSelectSection } from "../MusicFinder/AdvancedSettings/LocationSelectSection";
import { LengthSelector } from "../MusicFinder/AdvancedSettings/LengthSelector";
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

const lengths = ["30m", "1h", "1.5h", "2h", "2.5h", "3h"];

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
    length: "1.5h",
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
      bpm: false
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Advanced Search Options</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 my-4">
          <Input
            placeholder="What kind of music are you looking for?"
            value={params.prompt}
            onChange={(e) => setParams({ ...params, prompt: e.target.value })}
            className="w-full"
          />

          <div className="space-y-6">
            <PlatformSelectSection
              platforms={params.platforms}
              onChange={handlePlatformsChange}
            />

            {/* Reference Artists & Tracks - Moved to the top */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Reference Artists & Tracks</div>
                <AdvancedFilterToggle 
                  checked={params.activeFilters.references}
                  onCheckedChange={(checked) => updateActiveFilters('references', checked)}
                />
              </div>
              <ReferenceSearch
                selectedReferences={selectedReferences}
                onReferencesChange={handleReferencesChange}
                disabled={!spotifyEnabled || !params.activeFilters.references}
                placeholder={
                  !params.activeFilters.references
                    ? "Enable filter to use references"
                    : spotifyEnabled
                    ? "Search for artists or tracks..."
                    : "Enable Spotify to use references"
                }
              />
            </div>

            <LengthSelector
              value={params.length}
              onChange={length => setParams({ ...params, length })}
              lengths={lengths}
            />

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Underground ↔ Commercial</div>
                <AdvancedFilterToggle 
                  checked={params.activeFilters.commercial}
                  onCheckedChange={(checked) => updateActiveFilters('commercial', checked)}
                />
              </div>
              <CommercialSlider
                value={params.commercialFactor}
                onChange={value => setParams({ ...params, commercialFactor: value })}
                disabled={!params.activeFilters.commercial}
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Release Date Range</div>
                <AdvancedFilterToggle 
                  checked={params.activeFilters.releaseYear}
                  onCheckedChange={(checked) => updateActiveFilters('releaseYear', checked)}
                />
              </div>
              <ReleaseYearRangeSlider
                value={params.releaseYearRange}
                onChange={val => setParams({ ...params, releaseYearRange: val })}
                min={1990}
                max={2025}
                disabled={!params.activeFilters.releaseYear}
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Genre</div>
                <AdvancedFilterToggle 
                  checked={params.activeFilters.genre}
                  onCheckedChange={(checked) => updateActiveFilters('genre', checked)}
                />
              </div>
              <GenreSelect 
                value={params.genre} 
                onChange={v => setParams({ ...params, genre: v })} 
                genres={genres}
                disabled={!params.activeFilters.genre} 
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Location</div>
                <AdvancedFilterToggle 
                  checked={params.activeFilters.location}
                  onCheckedChange={(checked) => updateActiveFilters('location', checked)}
                />
              </div>
              <LocationSelectSection
                locations={locations}
                selected={params.locations}
                onAdd={addLocation}
                onRemove={removeLocation}
                disabled={!params.activeFilters.location}
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">BPM Range</div>
                <AdvancedFilterToggle 
                  checked={params.activeFilters.bpm}
                  onCheckedChange={(checked) => updateActiveFilters('bpm', checked)}
                />
              </div>
              <BpmFilter
                bpmRange={params.bpmRange}
                useBpmFilter={params.useBpmFilter && params.activeFilters.bpm}
                onChange={(useBpm, bpmRange) =>
                  setParams({
                    ...params,
                    useBpmFilter: useBpm,
                    bpmRange
                  })
                }
                disabled={!spotifyEnabled || !params.activeFilters.bpm}
              />
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
