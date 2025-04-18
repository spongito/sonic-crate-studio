import { Link } from "react-router-dom";
import { 
  Music, 
  Bot, 
  Download, 
  Users, 
  User, 
  Settings, 
  LogOut,
  Sparkles,
  LayoutDashboard,
  ListMusic
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/context/AuthContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { signOut, subscription } = useAuth();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0B0B0B]">
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-[#12121A] border-r border-white/5 shadow-xl">
        <Link to="/" className="p-6 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gold to-gold-dark shadow-gold-glow"></div>
          <span className="font-semibold text-lg text-white/90">Assorted Audio</span>
        </Link>
        
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link 
                to="/dashboard" 
                className="group flex items-center gap-3 px-3 py-3 rounded-lg sidebar-item"
              >
                <LayoutDashboard className="h-5 w-5 sidebar-item-icon" />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/music-finder" 
                className="group flex items-center gap-3 px-3 py-3 rounded-lg sidebar-item"
              >
                <Music className="h-5 w-5 sidebar-item-icon" />
                <span>Music Finder</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/curation-assistant" 
                className="group flex items-center gap-3 px-3 py-3 rounded-lg sidebar-item"
              >
                <Sparkles className="h-5 w-5 sidebar-item-icon" />
                <span>Curation Assistant</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/playlists" 
                className="group flex items-center gap-3 px-3 py-3 rounded-lg sidebar-item"
              >
                <ListMusic className="h-5 w-5 sidebar-item-icon" />
                <span>My Playlists</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/export" 
                className="group flex items-center gap-3 px-3 py-3 rounded-lg sidebar-item"
              >
                <Download className="h-5 w-5 sidebar-item-icon" />
                <span>Export Tools</span>
                <span className="ml-auto text-xs bg-gold text-black px-2 py-0.5 rounded-full font-medium">
                  Pro
                </span>
              </Link>
            </li>
            <li>
              <Link 
                to="/community" 
                className="group flex items-center gap-3 px-3 py-3 rounded-lg sidebar-item"
              >
                <Users className="h-5 w-5 sidebar-item-icon" />
                <span>Community</span>
              </Link>
            </li>
          </ul>
          
          <div className="border-t border-white/5 my-5"></div>
          
          <ul className="space-y-2">
            <li>
              <Link 
                to="/profile" 
                className="group flex items-center gap-3 px-3 py-3 rounded-lg sidebar-item"
              >
                <User className="h-5 w-5 sidebar-item-icon" />
                <span>Profile</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/settings" 
                className="group flex items-center gap-3 px-3 py-3 rounded-lg sidebar-item"
              >
                <Settings className="h-5 w-5 sidebar-item-icon" />
                <span>Settings</span>
              </Link>
            </li>
          </ul>
        </nav>
        
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
            onClick={signOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
