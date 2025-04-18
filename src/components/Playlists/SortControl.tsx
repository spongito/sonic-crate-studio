
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SortOption = "newest" | "oldest" | "name-asc" | "name-desc";

interface SortControlProps {
  value: SortOption;
  onValueChange: (value: SortOption) => void;
}

export function SortControl({ value, onValueChange }: SortControlProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sort by..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="newest">Date Created (Newest)</SelectItem>
        <SelectItem value="oldest">Date Created (Oldest)</SelectItem>
        <SelectItem value="name-asc">Name (A-Z)</SelectItem>
        <SelectItem value="name-desc">Name (Z-A)</SelectItem>
      </SelectContent>
    </Select>
  );
}
