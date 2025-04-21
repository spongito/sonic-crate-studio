
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

  // Ensure value is always a valid array to prevent "undefined is not iterable" errors
  const safeValue = React.useMemo(() => {
    if (!Array.isArray(value)) {
      console.warn("MultipleSelector: value is not an array", value);
      return [];
    }
    return value.filter(item => item && typeof item === 'object');
  }, [value]);

  // Ensure options is always a valid array
  const safeOptions = React.useMemo(() => {
    if (!Array.isArray(options)) {
      console.warn("MultipleSelector: options is not an array", options);
      return [];
    }
    return options.filter(item => item && typeof item === 'object');
  }, [options]);

  React.useEffect(() => {
    const fetchSearchResults = async () => {
      if (!debouncedInputValue || !onSearch) return;
      
      setLoading(true);
      try {
        const results = await onSearch(debouncedInputValue);
        // Ensure results is always an array of valid objects
        if (!Array.isArray(results)) {
          console.warn("Search results is not an array", results);
          setSearchResults([]);
        } else {
          setSearchResults(results.filter(item => item && typeof item === 'object'));
        }
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
          if (input.value === "" && safeValue.length > 0) {
            const newValue = [...safeValue];
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
    [onChange, safeValue]
  );

  const handleSelect = React.useCallback(
    (option: Option) => {
      if (!option || typeof option !== 'object') {
        console.warn("Invalid option selected", option);
        return;
      }
      
      const exists = safeValue.some((item) => item.value === option.value);
      if (exists) return;
      
      onChange?.([...safeValue, option]);
      setInputValue("");
      setOpen(false);
      inputRef.current?.focus();
    },
    [onChange, safeValue]
  );

  const handleRemove = React.useCallback(
    (option: Option) => {
      if (!option || typeof option !== 'object') {
        console.warn("Invalid option to remove", option);
        return;
      }
      
      const newValue = safeValue.filter((item) => item.value !== option.value);
      onChange?.(newValue);
      inputRef.current?.focus();
    },
    [onChange, safeValue]
  );

  // Calculate display options safely
  const displayOptions = React.useMemo(() => {
    if (onSearch) {
      return searchResults;
    }
    return safeOptions;
  }, [onSearch, searchResults, safeOptions]);
  
  const showPlaceholder = placeholder && (!safeValue.length || !hidePlaceholderWhenSelected);

  // Safety check before rendering to prevent CMDK errors
  if (!Array.isArray(safeValue)) {
    console.error("MultipleSelector: safeValue is not an array", safeValue);
    return null;
  }

  // Always ensure we have valid option objects
  const renderableOptions = displayOptions.filter(option => 
    option && typeof option === 'object' && 'value' in option && 'label' in option
  );

  return (
    <Command
      onKeyDown={handleKeyDown}
      className={`overflow-visible ${className || ""}`}
      shouldFilter={false} // We handle filtering ourselves or via the API
    >
      <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex flex-wrap gap-1">
          {safeValue.map((option) => {
            // Additional safety check for each item
            if (!option || typeof option !== 'object' || !('value' in option)) {
              return null;
            }
            
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
                    onClick={() => handleRemove(option)}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </Badge>
            );
          })}
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
              {!loading && renderableOptions.length === 0 && emptyIndicator}
              {!loading && renderableOptions.map((option) => (
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
