
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Location {
  value: string;
  label: string;
}

interface LocationSelectorProps {
  locations: Location[];
  selected: string[];
  onAdd: (val: string) => void;
  onRemove: (val: string) => void;
}

export function LocationSelector({ locations, selected, onAdd, onRemove }: LocationSelectorProps) {
  const [search, setSearch] = useState("");

  // Filter locations based on search text and removal of ones already selected
  const filtered = locations.filter(
    loc => loc.label.toLowerCase().includes(search.toLowerCase()) && !selected.includes(loc.value)
  );

  return (
    <div>
      <label className="text-sm font-medium mb-2 block">Location</label>
      <div className="flex flex-col space-y-2">
        {/* Selected locations */}
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {selected.map(value => {
              const loc = locations.find(l => l.value === value);
              return (
                <Badge key={value} variant="secondary" className="flex items-center gap-1 py-1.5">
                  {loc?.label || value}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={() => onRemove(value)}
                  >
                    <span className="sr-only">Remove</span>
                    ×
                  </Button>
                </Badge>
              );
            })}
          </div>
        )}
        <div className="relative">
          <input
            type="text"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Search locations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && filtered.length > 0 && (
            <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-popover p-1 text-popover-foreground shadow-md">
              {filtered.map(loc => (
                <div
                  key={loc.value}
                  className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                  onClick={() => {
                    onAdd(loc.value);
                    setSearch("");
                  }}
                >
                  {loc.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
