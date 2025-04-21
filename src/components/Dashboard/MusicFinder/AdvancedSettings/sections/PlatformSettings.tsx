
import { Platform, PlatformSelector } from "../../PlatformSelector";

interface PlatformSettingsProps {
  platforms: Platform[];
  onChange: (platforms: Platform[]) => void;
}

export function PlatformSettings({ platforms, onChange }: PlatformSettingsProps) {
  return (
    <div>
      <PlatformSelector platforms={platforms} onChange={onChange} />
    </div>
  );
}
