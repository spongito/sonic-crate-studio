
import { Link } from "react-router-dom";
import { User, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Navigation from "./Navigation";
import NavLink from "./NavLink";
import UserSection from "./UserSection";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { signOut, subscription } = useAuth();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0B0B0B]">
      <aside className="w-full md:w-64 bg-[#12121A] border-r border-white/5 shadow-xl">
        <Link to="/" className="p-6 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gold to-gold-dark shadow-gold-glow"></div>
          <span className="font-semibold text-lg text-white/90">Assorted Audio</span>
        </Link>
        
        <Navigation />
        
        <div className="border-t border-white/5 my-5"></div>
        
        <ul className="space-y-2 p-4">
          <NavLink to="/profile" icon={User}>
            Profile
          </NavLink>
          <NavLink to="/settings" icon={Settings}>
            Settings
          </NavLink>
        </ul>
        
        <UserSection 
          subscription={subscription} 
          onSignOut={signOut}
        />
      </aside>
      
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
