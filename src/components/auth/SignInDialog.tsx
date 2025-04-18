
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Music } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface SignInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SignInDialog = ({ open, onOpenChange }: SignInDialogProps) => {
  const { signInWithSpotify } = useAuth();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign in to continue</DialogTitle>
          <DialogDescription>
            Connect with Spotify to start creating AI-powered playlists
          </DialogDescription>
        </DialogHeader>
        <Card className="bg-background/60 border border-white/10 p-6">
          <div className="space-y-4">
            <Button 
              className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-white font-medium"
              onClick={signInWithSpotify}
            >
              <Music className="mr-2 h-4 w-4" />
              Continue with Spotify
            </Button>
            
            <p className="text-sm text-center text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
