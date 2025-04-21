
import { BpmFilter } from "../BpmFilter";

interface BpmSettingsProps {
  bpmRange?: [number, number];
  useBpmFilter: boolean;
  onChange: (useBpm: boolean, bpmRange?: [number, number]) => void;
  disabled?: boolean;
}

export function BpmSettings({ bpmRange, useBpmFilter, onChange, disabled }: BpmSettingsProps) {
  return (
    <BpmFilter
      bpmRange={bpmRange}
      useBpmFilter={useBpmFilter}
      onChange={onChange}
      disabled={disabled}
    />
  );
}
