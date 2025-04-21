
import { LocationSelectSection } from "../LocationSelectSection";

export interface Location {
  value: string;
  label: string;
}

interface LocationSettingsProps {
  locations: Location[];
  selected: string[];
  onAdd: (val: string) => void;
  onRemove: (val: string) => void;
}

export function LocationSettings({
  locations,
  selected,
  onAdd,
  onRemove,
}: LocationSettingsProps) {
  return (
    <LocationSelectSection
      locations={locations}
      selected={selected}
      onAdd={onAdd}
      onRemove={onRemove}
    />
  );
}
