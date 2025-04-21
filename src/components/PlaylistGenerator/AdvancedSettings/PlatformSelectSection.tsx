
import { PlatformSelector, Platform } from "../PlatformSelector";

interface PlatformSelectSectionProps {
  platforms: Platform[];
  onChange: (platforms: Platform[]) => void;
}

export function PlatformSelectSection({ platforms, onChange }: PlatformSelectSectionProps) {
  return (
    <div>
      <PlatformSelector platforms={platforms} onChange={onChange} />
    </div>
  );
}
