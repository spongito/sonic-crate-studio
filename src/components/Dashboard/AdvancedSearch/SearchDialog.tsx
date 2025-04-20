
import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { PlatformSelector, getDefaultPlatforms, type Platform } from "../MusicFinder/PlatformSelector";

export interface SearchParams {
  prompt: string;
  mode: string;
  genre: string;
  length: string;
  commercialFactor: number;
  description: string;
  referenceArtists: string;
  platforms: Platform[];
}

const genres = [
  "Afrobeat", "Ambient", "Blues", "Classical", "Deep House", 
  "Disco", "Drum & Bass", "Funk", "Hip-Hop", "House", 
  "Jazz", "Lo-fi", "Minimal", "Pop", "Progressive", 
  "R&B", "Reggae", "Rock", "Soul", "Tech House", "Techno", "Trance"
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
    referenceArtists: "",
    platforms: getDefaultPlatforms()
  });
  
  const handlePlatformsChange = (newPlatforms: Platform[]) => {
    setParams(prev => ({ ...prev, platforms: newPlatforms }));
  };

  const handleSubmit = () => {
    onSubmit(params);
    onOpenChange(false);
  };

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
            <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
            <Textarea
              placeholder="Add more details about the mood, context, or specific instructions..."
              value={params.description}
              onChange={(e) => setParams({ ...params, description: e.target.value })}
              className="resize-none"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Reference Artists (Optional)</label>
            <Input
              placeholder="Add reference artists separated by commas..."
              value={params.referenceArtists}
              onChange={(e) => setParams({ ...params, referenceArtists: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Example: Bonobo, Four Tet, Floating Points
            </p>
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
