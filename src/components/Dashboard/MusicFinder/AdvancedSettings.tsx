
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { PlatformSelector, type Platform } from "./PlatformSelector";
import { ReferenceSearch, type SpotifySearchResult } from "./ReferenceSearch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const genres = [
  "Afrobeat",
  "Ambient",
  "Blues",
  "Classical",
  "Deep House",
  "Disco",
  "Drum & Bass",
  "Funk",
  "Hip-Hop",
  "House",
  "Jazz",
  "Lo-fi",
  "Minimal",
  "Pop",
  "Progressive",
  "R&B",
  "Reggae",
  "Rock",
  "Soul",
  "Tech House",
  "Techno",
  "Trance",
];

const lengths = ["30m", "1h", "1.5h", "2h", "2.5h", "3h"];

const locations = [
  { value: "US", label: "United States" },
  { value: "UK", label: "United Kingdom" },
  { value: "NG", label: "Nigeria" },
  { value: "JM", label: "Jamaica" },
  { value: "TT", label: "Trinidad & Tobago" },
  { value: "global", label: "Global" },
];

export interface AdvancedSettingsParams {
  mode: string;
  description: string;
  genre: string;
  length: string;
  commercialFactor: number;
  referenceArtistIds?: string[];
  referenceTrackIds?: string[];
  locations?: string[];
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
          <Tabs defaultValue={params.mode} onValueChange={(value) => updateParams({ mode: value })}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="club-ready">Club Ready</TabsTrigger>
              <TabsTrigger value="crate-dig">Crate Dig & Mix</TabsTrigger>
              <TabsTrigger value="classic">Classic</TabsTrigger>
            </TabsList>
          </Tabs>

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
              <Select 
                value={params.locations?.[0] || "global"} 
                onValueChange={(value) => updateParams({ locations: [value] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(location => (
                    <SelectItem key={location.value} value={location.value}>
                      {location.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            
            <div>
              <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
              <Textarea
                placeholder="Add more details about the mood, context, or specific instructions..."
                value={params.description}
                onChange={(e) => updateParams({ description: e.target.value })}
                className="resize-none bg-background/60 min-h-[80px]"
              />
            </div>
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
