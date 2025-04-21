
import { Slider } from "@/components/ui/slider";

interface CommercialSliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function CommercialSlider({ value, onChange, disabled = false }: CommercialSliderProps) {
  return (
    <div className={disabled ? "opacity-50 pointer-events-none" : ""}>
      <div className="px-2">
        <Slider
          value={[value]}
          onValueChange={val => onChange(val[0])}
          min={0}
          max={100}
          step={1}
          disabled={disabled}
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>More Underground</span>
          <span>More Commercial</span>
        </div>
      </div>
    </div>
  );
}
