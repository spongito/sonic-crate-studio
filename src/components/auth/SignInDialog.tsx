
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Music, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface SignInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: boolean;
}

export const SignInDialog = ({ 
  open, 
  onOpenChange, 
  initialMode = false 
}: SignInDialogProps) => {
  const { signInWithSpotify, signInWithGoogle, signInWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(initialMode);

  useEffect(() => {
    if (open) {
      setIsSignUp(initialMode);
    }
  }, [open, initialMode]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signInWithEmail(email, password, isSignUp);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isSignUp ? "Create your account" : "Welcome back"}</DialogTitle>
          <DialogDescription>
            {isSignUp 
              ? "Sign up to start creating AI-powered playlists" 
              : "Sign in to continue creating AI-powered playlists"}
          </DialogDescription>
        </DialogHeader>
        <Card className="bg-background/60 border border-white/10 p-6">
          <div className="space-y-4">
            <div className="grid gap-4">
              <Button 
                className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-white font-medium"
                onClick={signInWithSpotify}
              >
                <Music className="mr-2 h-4 w-4" />
                Continue with Spotify
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full border-white/10 hover:bg-white/5"
                onClick={signInWithGoogle}
              >
                <Mail className="mr-2 h-4 w-4" />
                Continue with Google
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background/60 border-white/10"
                  placeholder="name@example.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background/60 border-white/10"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
              >
                {isSignUp ? "Sign up" : "Sign in"}
              </Button>
            </form>

            <Button 
              variant="link" 
              className="w-full text-muted-foreground"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp 
                ? "Already have an account? Sign in" 
                : "Don't have an account? Sign up"}
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
