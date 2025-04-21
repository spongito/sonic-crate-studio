
import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

export interface SpotifySearchResult {
  id: string;
  name: string;
  type: "artist" | "track";
  imageUrl?: string;
  artistName?: string; // For tracks
}

interface ReferenceSearchProps {
  onReferencesChange: (references: SpotifySearchResult[]) => void;
  selectedReferences: SpotifySearchResult[];
  disabled?: boolean;
  placeholder?: string;
}

export function ReferenceSearch({
  onReferencesChange,
  selectedReferences,
  disabled = false,
  placeholder = "Search for artists or tracks..."
}: ReferenceSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SpotifySearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const searchTimer = setTimeout(() => {
      if (query.trim().length >= 2) {
        searchSpotify(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [query]);

  const searchSpotify = async (searchQuery: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('spotify-search', {
        body: { query: searchQuery }
      });
      
      if (error) {
        console.error('Error searching Spotify:', error);
        return;
      }
      
      if (data && Array.isArray(data)) {
        setResults(data);
      }
    } catch (error) {
      console.error('Failed to search Spotify:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item: SpotifySearchResult) => {
    // Check if already selected
    if (!selectedReferences.some(ref => ref.id === item.id)) {
      const updatedReferences = [...selectedReferences, item];
      onReferencesChange(updatedReferences);
      setQuery("");
      setResults([]);
    }
    setOpen(false);
  };

  const handleRemove = (id: string) => {
    const updatedReferences = selectedReferences.filter(ref => ref.id !== id);
    onReferencesChange(updatedReferences);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-3">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="relative">
              <Input
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setOpen(true)}
                disabled={disabled}
                className="bg-background/60"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-r-transparent" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </div>
            </div>
          </PopoverTrigger>
          
          {query.trim().length >= 2 && (
            <PopoverContent className="p-0 w-[300px] max-h-[300px] overflow-y-auto" align="start">
              {results.length > 0 ? (
                <div className="py-2">
                  {results.map((result) => (
                    <button
                      key={result.id}
                      className="flex items-center gap-3 w-full hover:bg-muted px-3 py-2 text-left"
                      onClick={() => handleSelect(result)}
                    >
                      {result.imageUrl ? (
                        <img
                          src={result.imageUrl}
                          alt={result.name}
                          className="h-8 w-8 object-cover rounded"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                          <span className="text-xs">{result.type === "artist" ? "A" : "T"}</span>
                        </div>
                      )}
                      <div className="flex-1 truncate">
                        <div className="font-medium truncate">{result.name}</div>
                        {result.type === "track" && result.artistName && (
                          <div className="text-xs text-muted-foreground truncate">{result.artistName}</div>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground capitalize">
                        {result.type}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {loading ? "Searching..." : "No results found"}
                </div>
              )}
            </PopoverContent>
          )}
        </Popover>

        {selectedReferences.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedReferences.map((ref) => (
              <Badge key={ref.id} variant="secondary" className="flex items-center gap-1 py-1.5">
                {ref.type === "track" ? "🎵" : "👤"} {ref.name}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={() => handleRemove(ref.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
