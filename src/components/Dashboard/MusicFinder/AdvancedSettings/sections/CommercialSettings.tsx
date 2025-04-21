
import { CommercialSlider } from "../CommercialSlider";

interface CommercialSettingsProps {
  value: number;
  onChange: (val: number) => void;
}

export function CommercialSettings({ value, onChange }: CommercialSettingsProps) {
  return (
    <CommercialSlider value={value} onChange={onChange} />
  );
}
