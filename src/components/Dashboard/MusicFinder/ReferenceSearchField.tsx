
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import MultipleSelector from "@/components/ui/multiselect";
import type { Option } from "@/components/ui/multiselect";

export interface ReferenceItem {
  id: string;
  name: string;
  type: "artist" | "track";
  imageUrl?: string;
  artistName?: string;
}

type ReferenceSearchFieldProps = {
  value: ReferenceItem[];
  onChange: (items: ReferenceItem[]) => void;
  disabled?: boolean;
  placeholder?: string;
};

export function ReferenceSearchField({
  value,
  onChange,
  disabled = false,
  placeholder = "Search for artists or tracks...",
}: ReferenceSearchFieldProps) {

  // Map between Option and ReferenceItem
  const mapToOption = useCallback((item: ReferenceItem): Option => ({
    value: item.id,
    label: item.type === "track" && item.artistName
      ? `${item.name} — ${item.artistName}`
      : item.name,
    type: item.type,
    imageUrl: item.imageUrl
  }), []);

  const handleChange = useCallback((opts: Option[]) => {
    onChange(opts.map(opt => ({
      id: opt.value,
      name: (opt as any).name || opt.label,
      type: (opt as any).type || "track",
      imageUrl: (opt as any).imageUrl,
      artistName: (opt as any).artistName,
    })));
  }, [onChange]);

  // Debounced async fetch as you type
  const fetchSuggestions = useCallback(async (input: string): Promise<Option[]> => {
    if (!input || input.length < 1) return [];
    const { data, error } = await supabase.functions.invoke('spotify-search', {
      body: { query: input }
    });
    if (error || !Array.isArray(data)) return [];
    return data.map((item: ReferenceItem) => ({
      value: item.id,
      label: item.type === "track" && item.artistName ? `${item.name} — ${item.artistName}` : item.name,
      name: item.name,
      type: item.type,
      imageUrl: item.imageUrl,
      artistName: item.artistName
    }));
  }, []);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium mb-2 block">Reference Artists & Tracks</label>
      <MultipleSelector
        value={(value || []).map(mapToOption)}
        onChange={handleChange}
        onSearch={fetchSuggestions}
        placeholder={placeholder}
        delay={300}
        loadingIndicator={<div className="p-3 text-center text-sm">Searching...</div>}
        emptyIndicator={<div className="p-3 text-center text-sm">No results found</div>}
        disabled={disabled}
        badgeClassName="pr-7"
        inputProps={{
          minLength: 1, // only search after 1+ char
        }}
        maxSelected={5}
      />
    </div>
  );
}
