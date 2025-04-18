import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

type UserSubscription = {
  is_premium: boolean;
  playlists_generated: number;
  remaining_generations: number;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithSpotify: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string, isSignUp: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  subscription: UserSubscription | null;
  checkSubscription: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const navigate = useNavigate();

  const checkSubscription = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase.functions.invoke('check-subscription');
      setSubscription(data as UserSubscription);
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  useEffect(() => {
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);
        
        if (newSession?.user) {
          setTimeout(() => {
            checkSubscription();
          }, 0);
        } else {
          setSubscription(null);
        }
      }
    );
    
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setLoading(false);
      
      if (initialSession?.user) {
        checkSubscription();
      }
    });

    return () => {
      authSubscription.unsubscribe();
    };
  }, []);

  const signInWithSpotify = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'spotify',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error signing in with Spotify:", error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const signInWithEmail = async (email: string, password: string, isSignUp: boolean) => {
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error) {
      console.error("Error signing in with email:", error);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const value = {
    session,
    user,
    loading,
    signInWithSpotify,
    signInWithGoogle,
    signInWithEmail,
    signOut,
    subscription,
    checkSubscription,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
