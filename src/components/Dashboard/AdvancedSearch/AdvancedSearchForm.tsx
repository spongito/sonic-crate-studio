
import { useState, useEffect } from "react";
import { PlatformSelectSection } from "../MusicFinder/AdvancedSettings/PlatformSelectSection";
import { GenreSelect } from "../MusicFinder/AdvancedSettings/GenreSelect";
import { LocationSelectSection } from "../MusicFinder/AdvancedSettings/LocationSelectSection";
import { CommercialSlider } from "../MusicFinder/AdvancedSettings/CommercialSlider";
import { ReleaseYearRangeSlider } from "../MusicFinder/AdvancedSettings/ReleaseYearRangeSlider";
import { BpmFilter } from "../MusicFinder/AdvancedSettings/BpmFilter";
import { ReferenceSearch, type SpotifySearchResult } from "../MusicFinder/ReferenceSearch";
import { SearchFilterSection } from "./SearchFilterSection";
import { Input } from "@/components/ui/input";
import { getDefaultPlatforms, Platform } from "../MusicFinder/PlatformSelector";

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

interface AdvancedSearchFormProps {
  initialPrompt?: string;
  onSubmit: (params: any) => void;
  onCancel: () => void;
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

/**
 * Handles the full advanced search UI, filter blocks, and state.
 */
export function AdvancedSearchForm({ initialPrompt = "", onSubmit, onCancel }: AdvancedSearchFormProps) {
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
      bpm: true,
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

  const spotifyEnabled = params.platforms.find(p => p.id === 'spotify')?.enabled;

  const handleSubmit = () => {
    onSubmit(params);
  };

  return (
    <form
      onSubmit={e => { e.preventDefault(); handleSubmit(); }}
      className="space-y-4 my-4"
    >
      <Input
        placeholder="What kind of music are you looking for?"
        value={params.prompt}
        onChange={(e) => setParams({ ...params, prompt: e.target.value })}
        className="w-full"
      />
      <div className="space-y-6 mt-2">

        <PlatformSelectSection
          platforms={params.platforms}
          onChange={handlePlatformsChange}
        />

        <SearchFilterSection
          label="Reference Artists & Tracks"
          filterKey="references"
          checked={params.activeFilters.references}
          onCheckedChange={val => updateActiveFilters("references", val)}
        >
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
        </SearchFilterSection>

        <SearchFilterSection
          label="Commercial Balance"
          filterKey="commercial"
          checked={params.activeFilters.commercial}
          onCheckedChange={val => updateActiveFilters('commercial', val)}
        >
          <CommercialSlider
            value={params.commercialFactor}
            onChange={value => setParams({ ...params, commercialFactor: value })}
          />
        </SearchFilterSection>

        <SearchFilterSection
          label="Release Date Range"
          filterKey="releaseYear"
          checked={params.activeFilters.releaseYear}
          onCheckedChange={val => updateActiveFilters('releaseYear', val)}
        >
          <ReleaseYearRangeSlider
            value={params.releaseYearRange}
            onChange={val => setParams({ ...params, releaseYearRange: val })}
            min={1990}
            max={2025}
          />
        </SearchFilterSection>

        <SearchFilterSection
          label="Genres"
          filterKey="genre"
          checked={params.activeFilters.genre}
          onCheckedChange={val => updateActiveFilters('genre', val)}
        >
          <GenreSelect 
            value={params.genre} 
            onChange={v => setParams({ ...params, genre: v })} 
            genres={genres}
          />
        </SearchFilterSection>

        <SearchFilterSection
          label="Locations"
          filterKey="location"
          checked={params.activeFilters.location}
          onCheckedChange={val => updateActiveFilters('location', val)}
        >
          <LocationSelectSection
            locations={locations}
            selected={params.locations}
            onAdd={addLocation}
            onRemove={removeLocation}
          />
        </SearchFilterSection>

        <SearchFilterSection
          label="BPM Range"
          filterKey="bpm"
          checked={params.activeFilters.bpm}
          onCheckedChange={val => updateActiveFilters('bpm', val)}
        >
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
        </SearchFilterSection>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn">
          Find Music
        </button>
      </div>
    </form>
  );
}
