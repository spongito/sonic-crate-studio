
import { useState } from "react";
import { Check, Crown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
}

const UpgradeModal = ({ open, onClose }: UpgradeModalProps) => {
  const [plan, setPlan] = useState<"monthly" | "annual">("annual");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('create-checkout');
      
      if (error) {
        toast.error("Failed to start checkout process");
        console.error("Checkout error:", error);
        return;
      }
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.error("Checkout error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto bg-gold/20 p-3 rounded-full mb-3">
            <Crown className="h-6 w-6 text-gold" />
          </div>
          <DialogTitle className="text-center text-xl">Unlock Premium Features</DialogTitle>
          <DialogDescription className="text-center">
            You've used all your free generations this month. Upgrade to continue creating playlists.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-4 my-4">
          <button
            onClick={() => setPlan("monthly")}
            className={`flex-1 rounded-lg border ${
              plan === "monthly" 
              ? "border-gold bg-gold/10" 
              : "border-border bg-background"
            } p-4 text-center transition-colors`}
          >
            <div className="font-semibold">Monthly</div>
            <div className="text-2xl font-bold my-2">$9.99</div>
            <div className="text-sm text-muted-foreground">per month</div>
          </button>
          
          <button
            onClick={() => setPlan("annual")}
            className={`flex-1 rounded-lg border ${
              plan === "annual" 
              ? "border-gold bg-gold/10" 
              : "border-border bg-background"
            } p-4 text-center transition-colors relative`}
          >
            {plan === "annual" && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gold text-black text-xs font-medium px-2 py-0.5 rounded-full">
                Save 20%
              </div>
            )}
            <div className="font-semibold">Annual</div>
            <div className="text-2xl font-bold my-2">$7.99</div>
            <div className="text-sm text-muted-foreground">per month</div>
          </button>
        </div>
        
        <div className="space-y-3 my-4">
          <div className="flex items-center">
            <Check className="h-5 w-5 text-gold mr-2 flex-shrink-0" />
            <span>Unlimited playlist generations</span>
          </div>
          <div className="flex items-center">
            <Check className="h-5 w-5 text-gold mr-2 flex-shrink-0" />
            <span>Export to Spotify, Apple Music, and more</span>
          </div>
          <div className="flex items-center">
            <Check className="h-5 w-5 text-gold mr-2 flex-shrink-0" />
            <span>Advanced music assistant features</span>
          </div>
          <div className="flex items-center">
            <Check className="h-5 w-5 text-gold mr-2 flex-shrink-0" />
            <span>Priority support</span>
          </div>
        </div>
        
        <DialogFooter className="flex-col gap-3 mt-2">
          <Button 
            className="w-full bg-gold hover:bg-gold-dark text-black font-medium"
            onClick={handleSubscribe}
            disabled={isLoading}
          >
            <Crown className="h-4 w-4 mr-2" />
            {isLoading ? "Processing..." : "Subscribe Now"}
          </Button>
          <Button variant="outline" className="w-full" onClick={onClose}>
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;
