
import { Button } from "@/components/ui/button";

interface LengthSelectorProps {
  value: string;
  onChange: (val: string) => void;
  lengths: string[];
}

export function LengthSelector({ value, onChange, lengths }: LengthSelectorProps) {
  return (
    <div>
      <label className="text-sm font-medium mb-2 block">Set Length</label>
      <div className="flex gap-2 flex-wrap">
        {lengths.map(length => (
          <Button
            key={length}
            variant={value === length ? "default" : "outline"}
            onClick={() => onChange(length)}
            className="rounded-full"
          >
            {length}
          </Button>
        ))}
      </div>
    </div>
  );
}
