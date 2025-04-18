
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

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

export interface AdvancedSettingsParams {
  mode: string;
  description: string;
  genre: string;
  length: string;
  commercialFactor: number;
  referenceArtists: string;
}

interface AdvancedSettingsProps {
  params: AdvancedSettingsParams;
  onChange: (params: AdvancedSettingsParams) => void;
  onReset: () => void;
}

export function AdvancedSettings({ params, onChange, onReset }: AdvancedSettingsProps) {
  const [expanded, setExpanded] = useState(false);
  
  const updateParams = (update: Partial<AdvancedSettingsParams>) => {
    onChange({ ...params, ...update });
  };

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
              <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
              <Textarea
                placeholder="Add more details about the mood, context, or specific instructions..."
                value={params.description}
                onChange={(e) => updateParams({ description: e.target.value })}
                className="resize-none bg-background/60 min-h-[80px]"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Reference Artists (Optional)</label>
              <Input
                placeholder="Add reference artists separated by commas..."
                value={params.referenceArtists}
                onChange={(e) => updateParams({ referenceArtists: e.target.value })}
                className="bg-background/60"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Example: Bonobo, Four Tet, Floating Points
              </p>
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
