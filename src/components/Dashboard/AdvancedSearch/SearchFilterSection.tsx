
import { ReactNode } from "react";
import { AdvancedFilterToggle } from "../MusicFinder/AdvancedSettings/AdvancedFilterToggle";

interface SearchFilterSectionProps {
  label: string;
  filterKey: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children?: ReactNode;
  className?: string;
  showContent?: boolean;
}

/**
 * Renders a standard row for advanced search: label + toggle, and filter input below when showContent=true.
 */
export function SearchFilterSection({
  label,
  filterKey,
  checked,
  onCheckedChange,
  children,
  className = "",
  showContent = true,
}: SearchFilterSectionProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm font-medium flex-1">{label}</span>
        <AdvancedFilterToggle
          checked={checked}
          onCheckedChange={onCheckedChange}
        />
      </div>
      {checked && showContent && children}
    </div>
  );
}
