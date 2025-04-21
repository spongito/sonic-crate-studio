
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { PlatformSelector, type Platform } from "./PlatformSelector";
import { ReferenceSearch, type SpotifySearchResult } from "./ReferenceSearch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const genres = [
  "Afrobeat", "Ambient", "Blues", "Classical", "Deep House", 
  "Disco", "Drum & Bass", "Funk", "Hip-Hop", "House", 
  "Jazz", "Lo-fi", "Minimal", "Pop", "Progressive", 
  "R&B", "Reggae", "Rock", "Soul", "Tech House", "Techno", "Trance",
];

const lengths = ["30m", "1h", "1.5h", "2h", "2.5h", "3h"];

// Available locations with ISO codes
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
  onReset 
}: AdvancedSettingsProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedReferences, setSelectedReferences] = useState<SpotifySearchResult[]>([]);
  const [locationSearchInput, setLocationSearchInput] = useState("");
  
  const updateParams = (update: Partial<AdvancedSettingsParams>) => {
    onChange({ ...params, ...update });
  };
  
  const handleReferencesChange = (references: SpotifySearchResult[]) => {
    setSelectedReferences(references);
    
    // Extract IDs by type
    const artistIds = references
      .filter(ref => ref.type === 'artist')
      .map(ref => ref.id);
      
    const trackIds = references
      .filter(ref => ref.type === 'track')
      .map(ref => ref.id);
      
    updateParams({ 
      referenceArtistIds: artistIds.length > 0 ? artistIds : undefined,
      referenceTrackIds: trackIds.length > 0 ? trackIds : undefined 
    });
  };

  // Handle selecting a location
  const addLocation = (locationValue: string) => {
    if (!params.locations.includes(locationValue)) {
      updateParams({ 
        locations: [...params.locations, locationValue] 
      });
    }
    setLocationSearchInput("");
  };

  // Handle removing a location
  const removeLocation = (locationValue: string) => {
    updateParams({
      locations: params.locations.filter(loc => loc !== locationValue)
    });
  };
  
  // Filter locations based on search input
  const filteredLocations = locations.filter(loc => 
    loc.label.toLowerCase().includes(locationSearchInput.toLowerCase()) && 
    !params.locations.includes(loc.value)
  );
  
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
            <div>
              <label className="text-sm font-medium mb-2 block">Genre</label>
              <Select value={params.genre} onValueChange={(value) => updateParams({ genre: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a genre" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="any">Any Genre</SelectItem>
                  {genres.map((genre) => (
                    <SelectItem key={genre} value={genre.toLowerCase()}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <PlatformSelector 
                platforms={platforms}
                onChange={onPlatformsChange}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Location</label>
              <div className="flex flex-col space-y-2">
                {/* Selected locations */}
                {params.locations.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {params.locations.map(locationValue => {
                      const location = locations.find(loc => loc.value === locationValue);
                      return (
                        <Badge key={locationValue} variant="secondary" className="flex items-center gap-1 py-1.5">
                          {location?.label || locationValue}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0"
                            onClick={() => removeLocation(locationValue)}
                          >
                            <span className="sr-only">Remove</span>
                            ×
                          </Button>
                        </Badge>
                      );
                    })}
                  </div>
                )}
                
                {/* Location search input */}
                <div className="relative">
                  <input
                    type="text"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Search locations..."
                    value={locationSearchInput}
                    onChange={e => setLocationSearchInput(e.target.value)}
                  />
                  
                  {/* Location dropdown */}
                  {locationSearchInput && filteredLocations.length > 0 && (
                    <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-popover p-1 text-popover-foreground shadow-md">
                      {filteredLocations.map(location => (
                        <div
                          key={location.value}
                          className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                          onClick={() => addLocation(location.value)}
                        >
                          {location.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Set Length</label>
              <div className="flex gap-2 flex-wrap">
                {lengths.map((length) => (
                  <Button
                    key={length}
                    variant={params.length === length ? "default" : "outline"}
                    onClick={() => updateParams({ length })}
                    className="rounded-full"
                  >
                    {length}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Underground ↔ Commercial</label>
              <div className="px-2">
                <Slider
                  value={[params.commercialFactor]}
                  onValueChange={([value]) => updateParams({ commercialFactor: value })}
                  max={100}
                  step={1}
                  className="my-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>More Underground</span>
                  <span>More Commercial</span>
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Release Date Range</label>
              <div className="px-2">
                <Slider
                  value={params.releaseYearRange}
                  onValueChange={(value) => updateParams({ releaseYearRange: value as [number, number] })}
                  min={1990}
                  max={2025}
                  step={1}
                  className="my-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{params.releaseYearRange[0]}</span>
                  <span>{params.releaseYearRange[1]}</span>
                </div>
              </div>
            </div>
            
            <div className={spotifyEnabled ? "" : "opacity-50 pointer-events-none"}>
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox 
                  id="use-bpm-filter" 
                  checked={params.useBpmFilter}
                  onCheckedChange={(checked) => 
                    updateParams({ 
                      useBpmFilter: !!checked,
                      bpmRange: params.bpmRange || [90, 140]
                    })
                  }
                  disabled={!spotifyEnabled}
                />
                <Label htmlFor="use-bpm-filter" className="text-sm font-medium">
                  BPM Range {!spotifyEnabled && "(requires Spotify)"}
                </Label>
              </div>
              
              {params.useBpmFilter && spotifyEnabled && (
                <div className="px-2">
                  <Slider
                    value={params.bpmRange || [90, 140]}
                    onValueChange={(value) => updateParams({ bpmRange: value as [number, number] })}
                    min={60}
                    max={200}
                    step={1}
                    className="my-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{params.bpmRange?.[0] || 60} BPM</span>
                    <span>{params.bpmRange?.[1] || 200} BPM</span>
                  </div>
                </div>
              )}
            </div>
            
            <ReferenceSearch
              selectedReferences={selectedReferences}
              onReferencesChange={handleReferencesChange}
              disabled={!spotifyEnabled}
              placeholder={spotifyEnabled 
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
