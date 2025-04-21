
import { Slider } from "@/components/ui/slider";

interface CommercialSliderProps {
  value: number;
  onChange: (val: number) => void;
}

export function CommercialSlider({ value, onChange }: CommercialSliderProps) {
  return (
    <div>
      <label className="text-sm font-medium mb-2 block">Underground ↔ Commercial</label>
      <div className="px-2">
        <Slider
          value={[value]}
          onValueChange={([val]) => onChange(val)}
          max={100}
          step={1}
          className="my-4"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>More Underground</span>
          <span>More Commercial</span>
        </div>
      </div>
    </div>
  );
}
