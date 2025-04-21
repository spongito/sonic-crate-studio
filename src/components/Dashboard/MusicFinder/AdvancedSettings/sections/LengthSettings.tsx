
import { LengthSelector } from "../LengthSelector";

interface LengthSettingsProps {
  value: string;
  onChange: (length: string) => void;
  lengths: string[];
}

export function LengthSettings({ value, onChange, lengths }: LengthSettingsProps) {
  return (
    <LengthSelector value={value} onChange={onChange} lengths={lengths} />
  );
}
