
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
import { useNavigate } from "react-router-dom";
import { LoginErrorModal } from "./LoginErrorModal";

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
  const { signInWithSpotify, signInWithGoogle, signInWithEmail, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(initialMode);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setIsSignUp(initialMode);
    }
  }, [open, initialMode]);

  // If user is logged in, close dialog and redirect to dashboard
  useEffect(() => {
    if (user && open) {
      onOpenChange(false);
      navigate("/dashboard");
    }
  }, [user, open, onOpenChange, navigate]);

  const handleSpotifySignIn = async () => {
    setIsProcessing(true);
    try {
      await signInWithSpotify();
    } catch (error) {
      console.error("Error signing in with Spotify:", error);
      setShowErrorModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsProcessing(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setShowErrorModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await signInWithEmail(email, password, isSignUp);
    } catch (error) {
      console.error("Error signing in with email:", error);
      setShowErrorModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
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
                  onClick={handleSpotifySignIn}
                  disabled={isProcessing}
                >
                  <Music className="mr-2 h-4 w-4" />
                  Continue with Spotify
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full border-white/10 hover:bg-white/5"
                  onClick={handleGoogleSignIn}
                  disabled={isProcessing}
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
                    disabled={isProcessing}
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
                    disabled={isProcessing}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : (isSignUp ? "Sign up" : "Sign in")}
                </Button>
              </form>

              <Button 
                variant="link" 
                className="w-full text-muted-foreground"
                onClick={() => setIsSignUp(!isSignUp)}
                disabled={isProcessing}
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

      {/* Login Error Modal */}
      <LoginErrorModal 
        open={showErrorModal} 
        onOpenChange={setShowErrorModal} 
      />
    </>
  );
};
