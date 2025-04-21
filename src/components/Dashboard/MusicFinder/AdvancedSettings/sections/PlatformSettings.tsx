
import { Platform, PlatformSelectSection } from "../../PlatformSelector";

interface PlatformSettingsProps {
  platforms: Platform[];
  onChange: (platforms: Platform[]) => void;
}

export function PlatformSettings({ platforms, onChange }: PlatformSettingsProps) {
  return (
    <PlatformSelectSection platforms={platforms} onChange={onChange} />
  );
}
