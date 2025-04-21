
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { Option } from "./MultipleSelector";

interface MultiOptionBadgeProps {
  option: Option;
  badgeClassName?: string;
  disabled?: boolean;
  renderOption?: (option: Option) => React.ReactNode;
  onRemove?: (option: Option) => void;
}

export const MultiOptionBadge: React.FC<MultiOptionBadgeProps> = ({
  option,
  badgeClassName,
  disabled,
  renderOption,
  onRemove
}) => {
  return (
    <Badge
      key={option.value}
      className={badgeClassName}
      variant="secondary"
    >
      {renderOption ? renderOption(option) : option.label}
      {!disabled && (
        <button
          type="button"
          className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
          onClick={() => onRemove?.(option)}
        >
          <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
        </button>
      )}
    </Badge>
  );
};
