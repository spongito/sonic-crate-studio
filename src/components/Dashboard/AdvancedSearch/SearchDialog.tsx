
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { PlatformSelector, getDefaultPlatforms, type Platform } from "../MusicFinder/PlatformSelector";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ReferenceSearch, type SpotifySearchResult } from "../MusicFinder/ReferenceSearch";

export interface SearchParams {
  prompt: string;
  mode: string;
  genre: string;
  length: string;
  commercialFactor: number;
  description: string;
  platforms: Platform[];
  referenceArtistIds?: string[];
  referenceTrackIds?: string[];
  locations?: string[];
  releaseYearRange: [number, number];
  bpmRange?: [number, number];
  useBpmFilter: boolean;
}

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
];

const lengths = ["30m", "1h", "1.5h", "2h", "2.5h", "3h"];

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPrompt?: string;
  onSubmit: (params: SearchParams) => void;
}

export function SearchDialog({ open, onOpenChange, initialPrompt = "", onSubmit }: SearchDialogProps) {
  const [params, setParams] = useState<SearchParams>({
    prompt: initialPrompt,
    mode: "club-ready",
    genre: "",
    length: "1.5h",
    commercialFactor: 50,
    description: "",
    platforms: getDefaultPlatforms(),
    releaseYearRange: [1990, 2025],
    useBpmFilter: false,
    locations: ["global"]
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
  
  const handleReferencesChange = (references: SpotifySearchResult[]) => {
    setSelectedReferences(references);
    
    // Extract IDs by type
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
          
          <Tabs value={params.mode} onValueChange={(value) => setParams({ ...params, mode: value })}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="club-ready">Club Ready</TabsTrigger>
              <TabsTrigger value="crate-dig">Crate Dig & Mix</TabsTrigger>
              <TabsTrigger value="classic">Classic</TabsTrigger>
            </TabsList>
          </Tabs>

          <div>
            <label className="text-sm font-medium mb-2 block">Genre</label>
            <Select value={params.genre} onValueChange={(value) => setParams({ ...params, genre: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a genre" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                <SelectItem value="any">Any Genre</SelectItem>
                {genres.map((genre) => (
                  <SelectItem key={genre} value={genre.toLowerCase()}>{genre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <PlatformSelector 
              platforms={params.platforms}
              onChange={handlePlatformsChange}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Location</label>
            <Select 
              value={params.locations?.[0] || "global"} 
              onValueChange={(value) => setParams({ ...params, locations: [value] })}
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
                  onClick={() => setParams({ ...params, length })}
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
                onValueChange={([value]) => setParams({ ...params, commercialFactor: value })}
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
                onValueChange={(value) => setParams({ ...params, releaseYearRange: value as [number, number] })}
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
                id="use-bpm-filter-dialog" 
                checked={params.useBpmFilter}
                onCheckedChange={(checked) => 
                  setParams({ 
                    ...params, 
                    useBpmFilter: !!checked,
                    bpmRange: params.bpmRange || [90, 140]
                  })
                }
                disabled={!spotifyEnabled}
              />
              <Label htmlFor="use-bpm-filter-dialog" className="text-sm font-medium">
                BPM Range {!spotifyEnabled && "(requires Spotify)"}
              </Label>
            </div>
            
            {params.useBpmFilter && spotifyEnabled && (
              <div className="px-2">
                <Slider
                  value={params.bpmRange || [90, 140]}
                  onValueChange={(value) => setParams({ ...params, bpmRange: value as [number, number] })}
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
              onChange={(e) => setParams({ ...params, description: e.target.value })}
              className="resize-none"
            />
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
