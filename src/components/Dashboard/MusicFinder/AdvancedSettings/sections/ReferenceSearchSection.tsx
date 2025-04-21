
import { ReferenceSearchField, ReferenceItem } from "../../ReferenceSearchField";

interface ReferenceSearchSectionProps {
  value: ReferenceItem[];
  onChange: (items: ReferenceItem[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ReferenceSearchSection({
  value,
  onChange,
  disabled,
  placeholder
}: ReferenceSearchSectionProps) {
  return (
    <ReferenceSearchField
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
    />
  );
}
