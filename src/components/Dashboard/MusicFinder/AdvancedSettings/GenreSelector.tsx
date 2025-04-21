
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GenreSelectorProps {
  value: string;
  onChange: (value: string) => void;
  genres: string[];
}

export function GenreSelector({ value, onChange, genres }: GenreSelectorProps) {
  return (
    <div>
      <label className="text-sm font-medium mb-2 block">Genre</label>
      <Select value={value} onValueChange={onChange}>
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
  );
}
