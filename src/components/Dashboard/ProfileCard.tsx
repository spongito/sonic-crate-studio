
import { User, Crown, Music } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProfileCardProps {
  name?: string;
  email?: string;
  generationsUsed?: number;
  generationsTotal?: number;
  isPremium?: boolean;
}

const ProfileCard = ({
  name = "User",
  email = "user@example.com",
  generationsUsed = 6,
  generationsTotal = 15,
  isPremium = false
}: ProfileCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">{name}</h3>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
            {isPremium ? (
              <div className="bg-gold/20 px-3 py-1 rounded-full flex items-center">
                <Crown className="h-4 w-4 text-gold mr-1" />
                <span className="text-sm font-medium">Premium</span>
              </div>
            ) : (
              <div className="bg-secondary/50 px-3 py-1 rounded-full text-sm">
                Free Tier
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center">
                <Music className="h-4 w-4 mr-1" />
                Generations Used
              </span>
              <span className="text-sm font-medium">
                {generationsUsed}/{generationsTotal}
              </span>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-gold"
                style={{ width: `${(generationsUsed / generationsTotal) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {generationsTotal - generationsUsed} generations left this month
            </p>
          </div>
          
          {!isPremium && (
            <Button className="bg-gold hover:bg-gold-dark text-black w-full">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Premium
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
