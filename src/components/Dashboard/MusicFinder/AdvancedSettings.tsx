
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { PlatformSelectSection } from "./AdvancedSettings/PlatformSelectSection";
import { GenreSelect } from "./AdvancedSettings/GenreSelect";
import { LocationSelectSection } from "./AdvancedSettings/LocationSelectSection";
import { LengthSelector } from "./AdvancedSettings/LengthSelector";
import { CommercialSlider } from "./AdvancedSettings/CommercialSlider";
import { ReleaseYearRangeSlider } from "./AdvancedSettings/ReleaseYearRangeSlider";
import { BpmFilter } from "./AdvancedSettings/BpmFilter";
import { ReferenceSearch, SpotifySearchResult } from "./ReferenceSearch";
import { Platform } from "./PlatformSelector";

const genres = [
  "Afrobeat", "Ambient", "Blues", "Classical", "Deep House", 
  "Disco", "Drum & Bass", "Funk", "Hip-Hop", "House", 
  "Jazz", "Lo-fi", "Minimal", "Pop", "Progressive", 
  "R&B", "Reggae", "Rock", "Soul", "Tech House", "Techno", "Trance",
];

const lengths = ["30m", "1h", "1.5h", "2h", "2.5h", "3h"];

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

export interface AdvancedSettingsParams {
  mode?: string;
  description?: string;
  genre: string;
  length: string;
  commercialFactor: number;
  referenceArtistIds?: string[];
  referenceTrackIds?: string[];
  locations: string[];
  releaseYearRange: [number, number];
  bpmRange?: [number, number];
  useBpmFilter: boolean;
}

interface AdvancedSettingsProps {
  params: AdvancedSettingsParams;
  onChange: (params: AdvancedSettingsParams) => void;
  platforms: Platform[];
  onPlatformsChange: (platforms: Platform[]) => void;
  onReset: () => void;
}

export function AdvancedSettings({
  params,
  onChange,
  platforms,
  onPlatformsChange,
  onReset,
}: AdvancedSettingsProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedReferences, setSelectedReferences] = useState<SpotifySearchResult[]>([]);

  const updateParams = (update: Partial<AdvancedSettingsParams>) => {
    onChange({ ...params, ...update });
  };

  const handleReferencesChange = (references: SpotifySearchResult[]) => {
    setSelectedReferences(references);
    const artistIds = references.filter(ref => ref.type === 'artist').map(ref => ref.id);
    const trackIds = references.filter(ref => ref.type === 'track').map(ref => ref.id);
    updateParams({
      referenceArtistIds: artistIds.length > 0 ? artistIds : undefined,
      referenceTrackIds: trackIds.length > 0 ? trackIds : undefined,
    });
  };

  const addLocation = (locationValue: string) => {
    if (!params.locations.includes(locationValue)) {
      updateParams({
        locations: [...params.locations, locationValue],
      });
    }
  };

  const removeLocation = (locationValue: string) => {
    updateParams({
      locations: params.locations.filter(loc => loc !== locationValue),
    });
  };

  const spotifyEnabled = platforms.find(p => p.id === 'spotify')?.enabled;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold text-gradient">
          Dial In Your Playlist
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="text-xs flex items-center gap-1"
        >
          {expanded ? (
            <>
              Hide Options
              <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Show All Options
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {expanded && (
        <div className="space-y-6 animate-fade-in">
          <div className="space-y-4">
            <GenreSelect value={params.genre} onChange={v => updateParams({ genre: v })} genres={genres} />

            <PlatformSelectSection
              platforms={platforms}
              onChange={onPlatformsChange}
            />

            <LocationSelectSection
              locations={locations}
              selected={params.locations}
              onAdd={addLocation}
              onRemove={removeLocation}
            />

            <LengthSelector
              value={params.length}
              onChange={length => updateParams({ length })}
              lengths={lengths}
            />

            <CommercialSlider
              value={params.commercialFactor}
              onChange={value => updateParams({ commercialFactor: value })}
            />

            <ReleaseYearRangeSlider
              value={params.releaseYearRange}
              onChange={val => updateParams({ releaseYearRange: val })}
              min={1990}
              max={2025}
            />

            <BpmFilter
              bpmRange={params.bpmRange}
              useBpmFilter={params.useBpmFilter}
              onChange={(useBpm, bpmRange) =>
                updateParams({
                  useBpmFilter: useBpm,
                  bpmRange
                })}
              disabled={!spotifyEnabled}
            />

            <ReferenceSearch
              selectedReferences={selectedReferences}
              onReferencesChange={handleReferencesChange}
              disabled={!spotifyEnabled}
              placeholder={
                spotifyEnabled
                  ? "Search for artists or tracks..."
                  : "Enable Spotify to use references"
              }
            />
          </div>
          <div className="flex justify-start pt-4">
            <Button variant="outline" onClick={onReset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
