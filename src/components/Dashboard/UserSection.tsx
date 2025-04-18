
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface UserSectionProps {
  subscription: {
    is_premium?: boolean;
    remaining_generations?: number;
    playlists_generated?: number;
  } | null;
  onSignOut: () => void;
}

const UserSection = ({ subscription, onSignOut }: UserSectionProps) => {
  return (
    <div className="p-4 mt-auto">
      <div className="glass-morphism p-4 rounded-lg mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm">
            {subscription?.is_premium ? (
              <span className="text-gold font-medium">Premium</span>
            ) : (
              <>
                Generations left: <span className="text-white font-medium">
                  {subscription?.remaining_generations || 15}/15
                </span>
              </>
            )}
          </div>
          <ThemeToggle />
        </div>
        
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-gold-dark to-gold"
            style={{ 
              width: `${Math.min(((subscription?.playlists_generated || 0) / 15) * 100, 100)}%`,
              boxShadow: '0 0 10px rgba(219, 177, 59, 0.5)' 
            }}
          />
        </div>
      </div>
      
      <Button 
        variant="outline" 
        className="w-full justify-start border-white/10 hover:bg-white/5 hover:border-white/20"
        onClick={onSignOut}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );
};

export default UserSection;
