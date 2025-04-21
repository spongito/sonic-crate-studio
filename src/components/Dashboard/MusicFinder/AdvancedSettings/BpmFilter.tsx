
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface BpmFilterProps {
  bpmRange?: [number, number];
  useBpmFilter: boolean;
  onChange: (useBpmFilter: boolean, bpmRange: [number, number] | undefined) => void;
  disabled: boolean;
}

export function BpmFilter({ bpmRange, useBpmFilter, onChange, disabled }: BpmFilterProps) {
  return (
    <div className={disabled ? "opacity-50 pointer-events-none" : ""}>
      <div className="flex items-center space-x-2 mb-2">
        <Checkbox
          id="use-bpm-filter"
          checked={useBpmFilter}
          onCheckedChange={checked =>
            onChange(!!checked, bpmRange ?? [90, 140])
          }
          disabled={disabled}
        />
        <Label htmlFor="use-bpm-filter" className="text-sm font-medium">
          Enable BPM Range {disabled && "(requires Spotify)"}
        </Label>
      </div>
      {useBpmFilter && !disabled && (
        <div className="px-2">
          <Slider
            value={bpmRange || [90, 140]}
            onValueChange={(val) => onChange(true, val as [number, number])}
            min={60}
            max={200}
            step={1}
            className="my-4"
            disabled={disabled}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{bpmRange?.[0] || 60} BPM</span>
            <span>{bpmRange?.[1] || 200} BPM</span>
          </div>
        </div>
      )}
    </div>
  );
}
