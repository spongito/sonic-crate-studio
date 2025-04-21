
import { useState, useEffect } from "react";
import { useIsMobile } from "./use-mobile";

export type ColumnId = 
  | "title"
  | "album"
  | "platform"
  | "bpm"
  | "key_signature"
  | "genre"
  | "release_year"
  | "duration"
  | "actions";

export const DEFAULT_DESKTOP_COLUMNS: ColumnId[] = [
  "title",
  "platform",
  "bpm",
  "actions",
];

export const DEFAULT_MOBILE_COLUMNS: ColumnId[] = [
  "title",
  "actions",
];

export function useTableColumns() {
  const isMobile = useIsMobile();
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const defaultColumns = isMobile ? DEFAULT_MOBILE_COLUMNS : DEFAULT_DESKTOP_COLUMNS;
    const initialVisibility = DEFAULT_DESKTOP_COLUMNS.reduce(
      (acc, col) => ({
        ...acc,
        [col]: defaultColumns.includes(col),
      }),
      {}
    );
    setVisibleColumns(initialVisibility);
  }, [isMobile]);

  const toggleColumn = (columnId: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };

  return {
    visibleColumns,
    toggleColumn,
  };
}
