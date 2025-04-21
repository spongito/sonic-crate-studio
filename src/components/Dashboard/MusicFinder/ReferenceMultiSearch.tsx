
import * as React from "react";
import { useCallback } from "react";
import MultipleSelector, { Option } from "@/components/ui/multiselect";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

export type ReferenceType = "artist" | "track";

// Matches SpotifySearchResult interface from ReferenceSearch.tsx
export interface SpotifySearchResult {
  id: string;
  name: string;
  type: ReferenceType;
  imageUrl?: string;
  artistName?: string; // For tracks
}

export interface ReferenceMultiSearchProps {
  value: SpotifySearchResult[];
  onChange: (val: SpotifySearchResult[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

function formatOption(item: SpotifySearchResult): Option {
  if (!item || typeof item !== 'object') {
    console.warn('Invalid item passed to formatOption', item);
    return {
      value: 'invalid',
      label: 'Invalid Item',
      type: 'unknown',
    };
  }
  return {
    value: item.id || '',
    label: item.name || '',
    type: item.type || 'unknown',
    imageUrl: item.imageUrl,
    artistName: item.artistName
  };
}

export const ReferenceMultiSearch: React.FC<ReferenceMultiSearchProps> = ({
  value = [],
  onChange,
  disabled,
  placeholder = "Search for artists or tracks..."
}) => {
  // Ensure value is always a valid array
  const safeValue = React.useMemo(() => {
    if (!Array.isArray(value)) {
      console.warn('ReferenceMultiSearch: value is not an array', value);
      return [];
    }
    return value.filter(v => v && typeof v === 'object' && 'id' in v && 'name' in v);
  }, [value]);
  
  // Keep local input for display
  // Transform SpotifySearchResult[] <-> Option[]
  const optionMap = React.useMemo(() => {
    // For quick lookup on selection
    let map = new Map<string, SpotifySearchResult>();
    // Safely iterate only if value is defined
    if (Array.isArray(safeValue)) {
      safeValue.forEach(v => v && v.id && map.set(v.id, v));
    }
    return map;
  }, [safeValue]);

  const [loading, setLoading] = React.useState(false);

  // Debounced fetch function passed to MultipleSelector
  const handleSearch = useCallback(
    async (query: string) => {
      if (!query || query.trim().length < 1) return [];
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("spotify-search", {
          body: { query }
        });
        
        if (error) {
          console.error("Supabase function error:", error);
          return [];
        }
        
        if (!data) {
          console.warn("No data returned from spotify-search");
          return [];
        }
        
        if (Array.isArray(data)) {
          // convert items to Option[] and validate each item
          return data
            .filter(item => item && typeof item === 'object' && 'id' in item && 'name' in item)
            .map((item: any) => ({
              value: item.id || '',
              label: item.name || '',
              type: item.type || 'unknown',
              imageUrl: item.imageUrl,
              artistName: item.artistName,
            }));
        }
        return [];
      } catch (error) {
        console.error("Search error:", error);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // onChange bridge: Option[] -> SpotifySearchResult[]
  function handleChange(newOptions: Option[]) {
    if (!Array.isArray(newOptions)) {
      console.warn("Expected newOptions to be an array, got:", newOptions);
      newOptions = [];
    }
    
    const mapped: SpotifySearchResult[] = newOptions
      .filter(opt => opt && typeof opt === 'object' && 'value' in opt && 'label' in opt)
      .map(opt => ({
        id: opt.value,
        name: opt.label,
        type: (opt.type as ReferenceType) || 'track',
        imageUrl: opt.imageUrl,
        artistName: opt.artistName,
      }));
    onChange(mapped);
  }

  // Displayed chips/tags: add emoji for artist/track type
  function renderTag(option: Option) {
    if (!option || typeof option !== 'object') return null;
    
    return (
      <Badge
        key={option.value}
        variant="secondary"
        className="flex items-center gap-1 py-1.5 pr-2 pl-2"
      >
        {option.type === "track" ? "🎵" : "👤"} {option.label}
        {option.type === "track" && option.artistName && (
          <span className="ml-1 text-xs text-muted-foreground">– {option.artistName}</span>
        )}
      </Badge>
    );
  }

  // Ensure we always pass a valid array of Options to MultipleSelector
  const formattedOptions = React.useMemo(() => {
    if (!Array.isArray(safeValue)) return [];
    return safeValue.map(formatOption).filter(opt => opt && typeof opt === 'object');
  }, [safeValue]);

  return (
    <div>
      <label className="text-sm font-medium mb-2 block">Reference Artists & Tracks</label>
      <MultipleSelector
        options={[]} // Empty array for async mode
        value={formattedOptions}
        onChange={handleChange}
        onSearch={handleSearch}
        delay={300}
        placeholder={placeholder}
        loadingIndicator={
          <div className="px-4 py-2 text-center text-sm">Searching...</div>
        }
        emptyIndicator={
          <div className="p-4 text-center text-sm text-muted-foreground">
            No results found
          </div>
        }
        hidePlaceholderWhenSelected={true}
        disabled={disabled}
        badgeClassName="!gap-2"
        renderOption={renderTag}
      />
    </div>
  );
};
