
import { useState } from "react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { SignInDialog } from "@/components/auth/SignInDialog";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { user, signInWithSpotify } = useAuth();

  const handleOpenSignIn = (signup: boolean = false) => {
    setIsSignUp(signup);
    setShowSignIn(true);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gold to-gold-dark mr-2"></div>
              <span className="text-xl font-bold">Assorted Audio</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            {!user ? (
              <>
                <Button variant="ghost" onClick={signInWithSpotify}>Support</Button>
                <Button variant="outline" onClick={() => handleOpenSignIn(false)}>Sign In</Button>
                <Button onClick={() => handleOpenSignIn(true)}>Sign Up</Button>
              </>
            ) : (
              <Link to="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            )}
          </div>
          
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:bg-secondary focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
            {!user ? (
              <>
                <Button variant="ghost" onClick={signInWithSpotify}>Support</Button>
                <Button variant="outline" className="my-2" onClick={() => handleOpenSignIn(false)}>Sign In</Button>
                <Button className="mb-2" onClick={() => handleOpenSignIn(true)}>Sign Up</Button>
              </>
            ) : (
              <Link to="/dashboard">
                <Button className="my-2">Dashboard</Button>
              </Link>
            )}
            <div className="flex justify-end pt-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}

      <SignInDialog 
        open={showSignIn} 
        onOpenChange={setShowSignIn}
        initialMode={isSignUp}
      />
    </nav>
  );
};

export default Navbar;
