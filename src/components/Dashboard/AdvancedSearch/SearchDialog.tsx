
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { RefreshCw } from "lucide-react"
import { useState } from "react"

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (params: SearchParams) => void
}

export interface SearchParams {
  mode: string
  description: string
  genre: string
  length: string
  commercialFactor: number
  referenceArtists: string
}

const lengths = ["30m", "1h", "1.5h", "2h", "2.5h", "3h"]
const genres = ["House", "Techno", "Deep House", "Tech House", "Minimal", "Progressive"]

export function SearchDialog({ open, onOpenChange, onSubmit }: SearchDialogProps) {
  const [params, setParams] = useState<SearchParams>({
    mode: "club-ready",
    description: "",
    genre: "",
    length: "1.5h",
    commercialFactor: 50,
    referenceArtists: ""
  })

  const handleSubmit = () => {
    onSubmit(params)
    onOpenChange(false)
  }

  const handleReset = () => {
    setParams({
      mode: "club-ready",
      description: "",
      genre: "",
      length: "1.5h",
      commercialFactor: 50,
      referenceArtists: ""
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-4">Design your perfect set</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Tabs defaultValue="club-ready" onValueChange={(value) => setParams({ ...params, mode: value })}>
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="club-ready">Club Ready</TabsTrigger>
              <TabsTrigger value="crate-dig">Crate Dig & Mix</TabsTrigger>
              <TabsTrigger value="classic">Classic</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                placeholder="Describe your set..."
                value={params.description}
                onChange={(e) => setParams({ ...params, description: e.target.value })}
                className="resize-none bg-background/60"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Genre</label>
              <Select value={params.genre} onValueChange={(value) => setParams({ ...params, genre: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a genre" />
                </SelectTrigger>
                <SelectContent>
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
              <label className="text-sm font-medium mb-2 block">Reference Artists</label>
              <Input
                placeholder="Add reference artists..."
                value={params.referenceArtists}
                onChange={(e) => setParams({ ...params, referenceArtists: e.target.value })}
                className="bg-background/60"
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleReset}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button onClick={handleSubmit} className="bg-gold hover:bg-gold-dark text-black">
                Generate Set Plan
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
