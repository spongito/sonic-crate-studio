
import { Slider } from "@/components/ui/slider";

interface BpmFilterProps {
  bpmRange?: [number, number];
  onChange: (bpmRange: [number, number]) => void;
  disabled: boolean;
}

/**
 * Only renders the BPM slider (and value labels) if NOT disabled.
 * Removed the checkbox/toggle logic – parent controls visibility and enables/disables via a switch.
 */
export function BpmFilter({ bpmRange, onChange, disabled }: BpmFilterProps) {
  if (disabled) return null;

  return (
    <div className="px-2">
      <Slider
        value={bpmRange || [90, 140]}
        onValueChange={val => onChange(val as [number, number])}
        min={60}
        max={200}
        step={1}
        className="my-4"
      />
      <div className="flex justify-between text-xs text-muted-foreground pb-1">
        <span>{bpmRange?.[0] || 60} BPM</span>
        <span>{bpmRange?.[1] || 200} BPM</span>
      </div>
    </div>
  );
}
