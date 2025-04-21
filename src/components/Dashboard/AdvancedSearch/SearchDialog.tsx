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
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/clerk-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Plus, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "next/navigation";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { ReferenceSearchSection } from "@/components/Dashboard/MusicFinder/AdvancedSettings/sections/ReferenceSearchSection";
import { ReferenceItem } from "@/components/Dashboard/MusicFinder/ReferenceSearchField";

interface SearchDialogProps {
  children: React.ReactNode;
  onSearch: (
    query: string,
    options?: {
      artistIds?: string[];
      trackIds?: string[];
    }
  ) => void;
}

const SearchDialog = ({ children, onSearch }: SearchDialogProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedReferences, setSelectedReferences] = useState<ReferenceItem[]>([]);
  const { subscription } = useAuth();
  const { user } = useUser();

  const spotifyEnabled = true; // Assuming Spotify is always enabled for this component

  const handleSearch = () => {
    const artistIds = selectedReferences.filter(ref => ref.type === 'artist').map(ref => ref.id);
    const trackIds = selectedReferences.filter(ref => ref.type === 'track').map(ref => ref.id);
    onSearch(query, {
      artistIds: artistIds.length > 0 ? artistIds : undefined,
      trackIds: trackIds.length > 0 ? trackIds : undefined,
    });
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Search</AlertDialogTitle>
          <AlertDialogDescription>
            Enter your search query and refine your search with reference
            artists and tracks.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="query" className="text-right">
              Query
            </Label>
            <Input
              type="text"
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="col-span-3"
            />
          </div>

          <ReferenceSearchSection
            value={selectedReferences}
            onChange={setSelectedReferences /* or onReferencesChange depending on your parent state */}
            disabled={!spotifyEnabled}
            placeholder={
              spotifyEnabled
                ? "Search for artists or tracks..."
                : "Enable Spotify to use references"
            }
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSearch}>Search</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SearchDialog;
