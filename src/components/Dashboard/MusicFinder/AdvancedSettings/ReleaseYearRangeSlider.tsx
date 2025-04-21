
import { Slider } from "@/components/ui/slider";

interface ReleaseYearRangeSliderProps {
  value: [number, number];
  onChange: (val: [number, number]) => void;
  min: number;
  max: number;
  disabled?: boolean;
}

export function ReleaseYearRangeSlider({ value, onChange, min, max, disabled = false }: ReleaseYearRangeSliderProps) {
  return (
    <div className={disabled ? "opacity-50 pointer-events-none" : ""}>
      <div className="px-2">
        <Slider
          value={value}
          onValueChange={val => onChange(val as [number, number])}
          min={min}
          max={max}
          step={1}
          className="my-4"
          disabled={disabled}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{value[0]}</span>
          <span>{value[1]}</span>
        </div>
      </div>
    </div>
  );
}
