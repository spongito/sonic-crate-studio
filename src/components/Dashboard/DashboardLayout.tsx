
import { Link } from "react-router-dom";
import { 
  Music, 
  Bot, 
  Download, 
  Users, 
  User, 
  Settings, 
  LogOut 
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
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-sidebar border-r border-sidebar-border">
        <div className="p-4 flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gold to-gold-dark"></div>
          <span className="font-semibold text-lg">Assorted Audio</span>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link 
                to="/dashboard" 
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors"
              >
                <Music className="h-5 w-5" />
                <span>Playlist Generator</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/assistant" 
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors"
              >
                <Bot className="h-5 w-5" />
                <span>Music Assistant</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/export" 
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors"
              >
                <Download className="h-5 w-5" />
                <span>Export Tools</span>
                <span className="ml-auto text-xs bg-gold text-black px-2 py-0.5 rounded-full">
                  Pro
                </span>
              </Link>
            </li>
            <li>
              <Link 
                to="/community" 
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors"
              >
                <Users className="h-5 w-5" />
                <span>Community</span>
              </Link>
            </li>
          </ul>
          
          <div className="border-t border-sidebar-border my-4"></div>
          
          <ul className="space-y-2">
            <li>
              <Link 
                to="/profile" 
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors"
              >
                <User className="h-5 w-5" />
                <span>Profile</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/settings" 
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors"
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="p-4 mt-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground">
              {subscription?.is_premium ? (
                <span className="text-foreground font-medium">Premium</span>
              ) : (
                <>
                  Generations left: <span className="text-foreground font-medium">
                    {subscription?.remaining_generations || 15}/15
                  </span>
                </>
              )}
            </div>
            <ThemeToggle />
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-start"
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
