
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AdvancedSearchForm, SearchParams } from "./AdvancedSearchForm";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPrompt?: string;
  onSubmit: (params: SearchParams) => void;
}

/**
 * Pure Dialog shell for Advanced Search, form contents fully extracted.
 */
export function SearchDialog({ open, onOpenChange, initialPrompt = "", onSubmit }: SearchDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Advanced Search Options</DialogTitle>
        </DialogHeader>
        <AdvancedSearchForm
          initialPrompt={initialPrompt}
          onSubmit={(params) => {
            onSubmit(params);
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
        />
        <DialogFooter>
          {/* Footer actions now handled by AdvancedSearchForm */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
