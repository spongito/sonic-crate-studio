
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface GenreSelectProps {
  value: string;
  onChange: (genre: string) => void;
  genres: string[];
  disabled?: boolean;
}

export function GenreSelect({ value, onChange, genres, disabled = false }: GenreSelectProps) {
  const [search, setSearch] = useState("");
  
  // Parse the selected genres from the value string
  const selectedGenres = value ? value.split(",").map(g => g.trim()).filter(Boolean) : [];
  
  // Filter genres based on search
  const filteredGenres = genres
    .filter(genre => !selectedGenres.includes(genre))
    .filter(genre => genre.toLowerCase().includes(search.toLowerCase()));

  const addGenre = (genre: string) => {
    const newGenres = [...selectedGenres, genre];
    onChange(newGenres.join(", "));
    setSearch("");
  };

  const removeGenre = (genreToRemove: string) => {
    const newGenres = selectedGenres.filter(g => g !== genreToRemove);
    onChange(newGenres.join(", "));
  };

  return (
    <div className={disabled ? "opacity-50 pointer-events-none" : ""}>
      <div className="flex flex-col space-y-2">
        {/* Selected genres */}
        {selectedGenres.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedGenres.map(genre => (
              <Badge key={genre} variant="secondary" className="flex items-center gap-1 py-1.5">
                {genre}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={() => removeGenre(genre)}
                  disabled={disabled}
                >
                  <span className="sr-only">Remove</span>
                  ×
                </Button>
              </Badge>
            ))}
          </div>
        )}
        <div className="relative">
          <input
            type="text"
            className="flex h-10 w-full rounded-md border border-input bg-background/60 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Search genres..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            disabled={disabled}
          />
          {search && filteredGenres.length > 0 && !disabled && (
            <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-popover p-1 text-popover-foreground shadow-md">
              {filteredGenres.map(genre => (
                <div
                  key={genre}
                  className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                  onClick={() => addGenre(genre)}
                >
                  {genre}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
