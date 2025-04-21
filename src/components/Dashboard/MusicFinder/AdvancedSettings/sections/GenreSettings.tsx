
import { GenreSelect } from "../GenreSelect";

interface GenreSettingsProps {
  value: string;
  onChange: (genre: string) => void;
  genres: string[];
}

export function GenreSettings({ value, onChange, genres }: GenreSettingsProps) {
  return (
    <GenreSelect value={value} onChange={onChange} genres={genres} />
  );
}
