
import { Slider } from "@/components/ui/slider";

interface ReleaseYearRangeSliderProps {
  value: [number, number];
  onChange: (val: [number, number]) => void;
  min: number;
  max: number;
}

export function ReleaseYearRangeSlider({ value, onChange, min, max }: ReleaseYearRangeSliderProps) {
  return (
    <div>
      <label className="text-sm font-medium mb-2 block">Release Date Range</label>
      <div className="px-2">
        <Slider
          value={value}
          onValueChange={val => onChange(val as [number, number])}
          min={min}
          max={max}
          step={1}
          className="my-4"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{value[0]}</span>
          <span>{value[1]}</span>
        </div>
      </div>
    </div>
  );
}
