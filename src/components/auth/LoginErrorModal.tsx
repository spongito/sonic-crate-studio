
import { useEffect, useRef } from "react";
import { 
  Dialog, 
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface LoginErrorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LoginErrorModal = ({ open, onOpenChange }: LoginErrorModalProps) => {
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  
  // Auto-close the modal after 3 seconds
  useEffect(() => {
    if (open) {
      timerRef.current = setTimeout(() => {
        onOpenChange(false);
      }, 3000);
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md border border-white/10 bg-black/90 backdrop-blur-lg"
        aria-labelledby="error-title"
        aria-describedby="error-description"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="rounded-full bg-red-900/30 p-3 border border-red-500/30">
            <AlertCircle className="h-6 w-6 text-red-500" aria-hidden="true" />
          </div>
          
          <DialogTitle id="error-title" className="text-lg font-medium">
            Login failed
          </DialogTitle>
          
          <DialogDescription id="error-description" className="text-muted-foreground">
            Please try again with different credentials or another login method.
          </DialogDescription>
        </div>
        
        <DialogFooter className="mt-4 flex justify-center">
          <Button 
            className="bg-gold hover:bg-gold-dark text-black font-medium"
            onClick={() => onOpenChange(false)}
            autoFocus
          >
            Try Again
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
