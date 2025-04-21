
import { Switch } from "@/components/ui/switch";

interface AdvancedFilterToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function AdvancedFilterToggle({ checked, onCheckedChange, disabled = false }: AdvancedFilterToggleProps) {
  return (
    <Switch
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className="data-[state=checked]:bg-primary"
      aria-label="Toggle filter"
    />
  );
}
