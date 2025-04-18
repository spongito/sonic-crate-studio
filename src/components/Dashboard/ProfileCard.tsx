
import { User, Crown, Music } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProfileCardProps {
  onUpgrade?: () => void;
}

const ProfileCard = ({ onUpgrade }: ProfileCardProps) => {
  const { user, subscription } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleUpgrade = async () => {
    if (onUpgrade) {
      onUpgrade();
      return;
    }
    
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

  const generationsUsed = subscription?.playlists_generated || 0;
  const generationsTotal = 15;
  const isPremium = subscription?.is_premium || false;
  
  return (
    <Card className="neo-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
              <User className="h-6 w-6 text-white/80" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white/90">{user?.user_metadata.name || 'User'}</h3>
              <p className="text-sm text-white/60">{user?.email}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-5">
          <div className="flex items-center justify-between">
            {isPremium ? (
              <div className="bg-gold/20 px-3 py-1 rounded-full flex items-center border border-gold/30">
                <Crown className="h-4 w-4 text-gold mr-1" />
                <span className="text-sm font-medium text-gold">Premium</span>
              </div>
            ) : (
              <div className="bg-white/5 px-3 py-1 rounded-full text-sm border border-white/10">
                Free Tier
              </div>
            )}
            
            <div className="text-sm text-white/60 flex items-center">
              <Music className="h-4 w-4 mr-1 text-gold" />
              <span><span className="font-medium text-white">
                {generationsUsed}/{generationsTotal}
              </span> used</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-gold-dark to-gold"
                style={{ 
                  width: `${Math.min((generationsUsed / generationsTotal) * 100, 100)}%`,
                  boxShadow: '0 0 10px rgba(219, 177, 59, 0.5)'
                }}
              />
            </div>
            <p className="text-xs text-white/60">
              {isPremium ? 
                "Unlimited generations with Premium" : 
                `${generationsTotal - generationsUsed} generations left this month`
              }
            </p>
          </div>
          
          {!isPremium && (
            <Button 
              className="neo-gold-button w-full"
              onClick={handleUpgrade}
              disabled={isLoading}
            >
              <Crown className="h-4 w-4 mr-2" />
              {isLoading ? "Processing..." : "Upgrade to Premium"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
