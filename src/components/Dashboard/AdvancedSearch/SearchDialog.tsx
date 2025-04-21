
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { ReferenceSearchSection } from "@/components/Dashboard/MusicFinder/AdvancedSettings/sections/ReferenceSearchSection";
import { ReferenceItem } from "@/components/Dashboard/MusicFinder/ReferenceSearchField";

export interface SearchParams {
  prompt: string;
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
  platforms: { id: string; enabled: boolean; }[];
}

interface SearchDialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialPrompt?: string;
  onSubmit: (params: SearchParams) => void;
}

export function SearchDialog({ 
  children, 
  open: controlledOpen, 
  onOpenChange: setControlledOpen,
  initialPrompt = "",
  onSubmit 
}: SearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [selectedReferences, setSelectedReferences] = useState<ReferenceItem[]>([]);
  const { subscription } = useAuth();

  // Handle controlled/uncontrolled state
  const isControlled = controlledOpen !== undefined && setControlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : open;
  const setIsOpen = isControlled ? setControlledOpen : setOpen;
  
  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  // Default minimal search params
  const [searchParams, setSearchParams] = useState<SearchParams>({
    prompt: initialPrompt,
    genre: "",
    length: "1.5h",
    commercialFactor: 50,
    releaseYearRange: [1990, 2025],
    useBpmFilter: false,
    locations: ["global"],
    platforms: [
      { id: "spotify", enabled: true },
      { id: "youtube", enabled: false }
    ]
  });

  const handleUpdateParams = (update: Partial<SearchParams>) => {
    setSearchParams(prev => ({
      ...prev,
      ...update
    }));
  };

  const handleReferencesChange = (refs: ReferenceItem[]) => {
    setSelectedReferences(refs);
    const artistIds = refs.filter(ref => ref.type === 'artist').map(ref => ref.id);
    const trackIds = refs.filter(ref => ref.type === 'track').map(ref => ref.id);
    
    handleUpdateParams({
      referenceArtistIds: artistIds.length > 0 ? artistIds : undefined,
      referenceTrackIds: trackIds.length > 0 ? trackIds : undefined
    });
  };

  const handleSearch = () => {
    if (!prompt.trim()) {
      toast({
        title: "Please enter a prompt",
        variant: "destructive"
      });
      return;
    }
    
    onSubmit({
      ...searchParams,
      prompt
    });
    
    setIsOpen(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Advanced Search</AlertDialogTitle>
          <AlertDialogDescription>
            Enter your search query and refine your search with reference
            artists and tracks.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="prompt" className="text-right">
              Prompt
            </Label>
            <Input
              type="text"
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="col-span-3"
            />
          </div>

          <ReferenceSearchSection
            value={selectedReferences}
            onChange={handleReferencesChange}
            disabled={false}
            placeholder="Search for artists or tracks..."
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSearch}>Search</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
