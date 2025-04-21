
import { LocationSelector } from "./LocationSelector";

interface Location {
  value: string;
  label: string;
}

interface LocationSelectSectionProps {
  locations: Location[];
  selected: string[];
  onAdd: (val: string) => void;
  onRemove: (val: string) => void;
}

export function LocationSelectSection({
  locations,
  selected,
  onAdd,
  onRemove,
}: LocationSelectSectionProps) {
  return (
    <LocationSelector
      locations={locations}
      selected={selected}
      onAdd={onAdd}
      onRemove={onRemove}
    />
  );
}
