
import React, { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SearchInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onChange, onClear, ...props }, ref) => {
    const handleClear = () => {
      if (onChange) {
        // Create a synthetic event to simulate clearing the input
        const event = {
          target: { value: "" }
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(event);
      }
      
      if (onClear) {
        onClear();
      }
    };

    return (
      <div className="relative w-full">
        <Input
          ref={ref}
          value={value}
          onChange={onChange}
          className={cn("pr-10", className)}
          type="text"
          {...props}
        />
        {value && value.toString().length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 h-5 w-5 p-0 flex items-center justify-center text-muted-foreground hover:text-foreground"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

export { SearchInput };
