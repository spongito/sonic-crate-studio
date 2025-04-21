
import { useState } from "react";
import { Platform } from "./PlatformSelector";
import { ReferenceItem } from "./ReferenceSearchField";
import {
  PresetsHeader,
  GenreSettings,
  PlatformSettings,
  LocationSettings,
  LengthSettings,
  CommercialSettings,
  ReleaseYearSettings,
  BpmSettings,
  ReferenceSearchSection,
  ResetButton,
} from "./AdvancedSettings/sections";

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

const GENRES = [
  "Afrobeat", "Ambient", "Blues", "Classical", "Deep House", 
  "Disco", "Drum & Bass", "Funk", "Hip-Hop", "House", 
  "Jazz", "Lo-fi", "Minimal", "Pop", "Progressive", 
  "R&B", "Reggae", "Rock", "Soul", "Tech House", "Techno", "Trance",
];

const LENGTHS = ["30m", "1h", "1.5h", "2h", "2.5h", "3h"];

const LOCATIONS = [
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

export function AdvancedSettings({
  params,
  onChange,
  platforms,
  onPlatformsChange,
  onReset,
}: AdvancedSettingsProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedReferences, setSelectedReferences] = useState<ReferenceItem[]>([]);

  const updateParams = (update: Partial<AdvancedSettingsParams>) => {
    onChange({ ...params, ...update });
  };

  const handleReferencesChange = (refs: ReferenceItem[]) => {
    setSelectedReferences(refs);
    const artistIds = refs.filter(ref => ref.type === 'artist').map(ref => ref.id);
    const trackIds = refs.filter(ref => ref.type === 'track').map(ref => ref.id);
    updateParams({
      referenceArtistIds: artistIds.length > 0 ? artistIds : undefined,
      referenceTrackIds: trackIds.length > 0 ? trackIds : undefined,
    });
  };

  const addLocation = (loc: string) => {
    if (!params.locations.includes(loc)) {
      updateParams({ locations: [...params.locations, loc] });
    }
  };
  const removeLocation = (loc: string) => {
    updateParams({
      locations: params.locations.filter(l => l !== loc),
    });
  };
  const spotifyEnabled = platforms.some(p => p.id === "spotify" && p.enabled);

  return (
    <div className="space-y-6 animate-fade-in">
      <PresetsHeader expanded={expanded} onToggle={() => setExpanded(!expanded)} />
      {expanded && (
        <div className="space-y-6 animate-fade-in">
          <GenreSettings value={params.genre} onChange={v => updateParams({ genre: v })} genres={GENRES} />
          <PlatformSettings platforms={platforms} onChange={onPlatformsChange} />
          <LocationSettings
            locations={LOCATIONS}
            selected={params.locations}
            onAdd={addLocation}
            onRemove={removeLocation}
          />
          <LengthSettings value={params.length} onChange={l => updateParams({ length: l })} lengths={LENGTHS} />
          <CommercialSettings value={params.commercialFactor} onChange={v => updateParams({ commercialFactor: v })} />
          <ReleaseYearSettings 
            value={params.releaseYearRange}
            onChange={val => updateParams({ releaseYearRange: val })}
            min={1990}
            max={2025}
          />
          <BpmSettings
            bpmRange={params.bpmRange}
            useBpmFilter={params.useBpmFilter}
            onChange={(useBpm, range) => updateParams({ useBpmFilter: useBpm, bpmRange: range })}
            disabled={!spotifyEnabled}
          />
          <ReferenceSearchSection
            value={selectedReferences}
            onChange={handleReferencesChange}
            disabled={!spotifyEnabled}
            placeholder={
              spotifyEnabled
                ? "Search for artists or tracks..."
                : "Enable Spotify to use references"
            }
          />
          <div className="flex justify-start pt-4">
            <ResetButton onClick={onReset} />
          </div>
        </div>
      )}
    </div>
  );
}
