
import * as React from "react";
import { Table } from "@tanstack/react-table";
import type { Track } from "@/types/table";

export function useTableRowSelection(table: Table<Track>) {
  const [lastSelectedRowIndex, setLastSelectedRowIndex] = React.useState<number | null>(null);

  // Handle row click with keyboard modifiers for selection
  const handleRowClick = (event: React.MouseEvent, rowIndex: number) => {
    const { shiftKey, metaKey, ctrlKey } = event;
    const isModifierKeyPressed = metaKey || ctrlKey; // Meta for Mac, Ctrl for Windows
    
    if (shiftKey && lastSelectedRowIndex !== null) {
      // Range selection with shift key
      const start = Math.min(lastSelectedRowIndex, rowIndex);
      const end = Math.max(lastSelectedRowIndex, rowIndex);
      
      // Create a new selection object, preserving existing selections if modifier key is pressed
      const newSelection = isModifierKeyPressed ? { ...table.getState().rowSelection } : {};
      
      // Select all rows in the range
      for (let i = start; i <= end; i++) {
        const row = table.getRowModel().rows[i];
        if (row) {
          newSelection[row.id] = true;
        }
      }
      
      // Update the table's row selection state
      table.setRowSelection(newSelection);
    } else {
      // Single row selection
      const row = table.getRowModel().rows[rowIndex];
      if (row) {
        if (isModifierKeyPressed) {
          // Toggle this row's selection without affecting others if modifier key is pressed
          const isSelected = table.getState().rowSelection[row.id] ?? false;
          table.setRowSelection({
            ...table.getState().rowSelection,
            [row.id]: !isSelected,
          });
        } else {
          // Check if this row is already selected
          const isSelected = table.getState().rowSelection[row.id] ?? false;
          if (isSelected) {
            // If already selected, deselect it (clear all selections)
            table.setRowSelection({});
          } else {
            // Clear selection and select only this row if no modifier key
            table.setRowSelection({
              [row.id]: true,
            });
          }
        }
      }
    }
    
    // Update the last selected row index
    setLastSelectedRowIndex(rowIndex);
  };

  return { handleRowClick };
}
