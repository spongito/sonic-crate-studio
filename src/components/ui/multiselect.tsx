
import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";

export interface Option {
  value: string;
  label: string;
  type?: string;
  imageUrl?: string;
  artistName?: string;
  [key: string]: any;
}

interface MultipleSelectorProps {
  value?: Option[];
  onChange?: (value: Option[]) => void;
  placeholder?: string;
  options?: Option[];
  onSearch?: (value: string) => Promise<Option[]>;
  delay?: number;
  loadingIndicator?: React.ReactNode;
  emptyIndicator?: React.ReactNode;
  className?: string;
  badgeClassName?: string;
  renderOption?: (option: Option) => React.ReactNode;
  disabled?: boolean;
  hidePlaceholderWhenSelected?: boolean;
}

export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

const MultipleSelector = ({
  value = [],
  onChange,
  placeholder,
  options = [],
  onSearch,
  delay = 300,
  loadingIndicator,
  emptyIndicator,
  className,
  badgeClassName,
  renderOption,
  disabled = false,
  hidePlaceholderWhenSelected = false,
}: MultipleSelectorProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<Option[]>([]);
  const [loading, setLoading] = React.useState(false);
  
  const debouncedInputValue = useDebounce(inputValue, delay);

  React.useEffect(() => {
    const fetchSearchResults = async () => {
      if (!debouncedInputValue || !onSearch) return;
      
      setLoading(true);
      try {
        const results = await onSearch(debouncedInputValue);
        setSearchResults(results || []);
      } catch (error) {
        console.error("Error searching:", error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [debouncedInputValue, onSearch]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current;
      if (input) {
        if (e.key === "Delete" || e.key === "Backspace") {
          if (input.value === "") {
            const newValue = [...value];
            newValue.pop();
            onChange?.(newValue);
          }
        }
        // Close dropdown when escape is pressed
        if (e.key === "Escape") {
          setOpen(false);
        }
      }
    },
    [onChange, value]
  );

  const handleSelect = React.useCallback(
    (option: Option) => {
      const exists = value.some((item) => item.value === option.value);
      if (exists) return;
      
      onChange?.([...value, option]);
      setInputValue("");
      setOpen(false);
      inputRef.current?.focus();
    },
    [onChange, value]
  );

  const handleRemove = React.useCallback(
    (option: Option) => {
      const newValue = value.filter((item) => item.value !== option.value);
      onChange?.(newValue);
      inputRef.current?.focus();
    },
    [onChange, value]
  );

  // Make sure we have arrays for both options and value
  const safeOptions = options || [];
  const safeValue = value || [];
  
  const displayOptions = onSearch ? (searchResults || []) : safeOptions;
  const showPlaceholder = placeholder && (!safeValue.length || !hidePlaceholderWhenSelected);

  return (
    <Command
      onKeyDown={handleKeyDown}
      className={`overflow-visible ${className}`}
      shouldFilter={false} // We handle filtering ourselves or via the API
    >
      <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex flex-wrap gap-1">
          {safeValue.map((option) => (
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
                  onClick={() => handleRemove(option)}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </Badge>
          ))}
          {/* Avoid having the "Search" text being read by screen readers */}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onFocus={() => setOpen(true)}
            className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={showPlaceholder ? placeholder : ""}
            disabled={disabled}
          />
        </div>
      </div>
      <div className="relative">
        {open && inputValue.length > 0 && (
          <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <CommandGroup className="h-full overflow-auto">
              {loading && loadingIndicator}
              {!loading && displayOptions.length === 0 && emptyIndicator}
              {!loading && displayOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => handleSelect(option)}
                  className="flex items-center gap-2 px-2 py-1.5"
                >
                  {option.imageUrl && (
                    <img 
                      src={option.imageUrl} 
                      alt={option.label}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  )}
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    {option.artistName && (
                      <span className="text-xs text-muted-foreground">{option.artistName}</span>
                    )}
                  </div>
                  {option.type && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {option.type}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        )}
      </div>
    </Command>
  );
};

export default MultipleSelector;
