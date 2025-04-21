
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GenreSelectProps {
  value: string;
  onChange: (value: string) => void;
  genres: string[];
}

export function GenreSelect({ value, onChange, genres }: GenreSelectProps) {
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
