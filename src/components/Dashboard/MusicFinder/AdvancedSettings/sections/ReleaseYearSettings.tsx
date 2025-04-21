
import { ReleaseYearRangeSlider } from "../ReleaseYearRangeSlider";

interface ReleaseYearSettingsProps {
  value: [number, number];
  onChange: (v: [number, number]) => void;
  min: number;
  max: number;
}

export function ReleaseYearSettings({ value, onChange, min, max }: ReleaseYearSettingsProps) {
  return (
    <ReleaseYearRangeSlider value={value} onChange={onChange} min={min} max={max} />
  );
}
