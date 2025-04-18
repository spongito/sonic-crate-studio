
import { Link } from "react-router-dom";
import { 
  Music, 
  Download, 
  Users, 
  Sparkles,
  LayoutDashboard,
  ListMusic
} from "lucide-react";
import NavLink from "./NavLink";
import { useAuth } from "@/context/AuthContext";

const Navigation = () => {
  const { subscription } = useAuth();
  const isPremium = subscription?.is_premium || false;
  const remainingGenerations = subscription?.remaining_generations || 0;

  return (
    <nav className="p-4">
      <ul className="space-y-2">
        <NavLink to="/dashboard" icon={LayoutDashboard}>
          Dashboard
        </NavLink>
        <NavLink to="/playlists" icon={ListMusic}>
          My Playlists
        </NavLink>
        <NavLink to="/music-finder" icon={Music}>
          Music Finder
        </NavLink>
        <NavLink 
          to="/curation-assistant" 
          icon={Sparkles}
          isPremium={true}
          isRestricted={!isPremium}
        >
          Curation Assistant
        </NavLink>
        <NavLink 
          to="/export" 
          icon={Download} 
          isPremium={true}
          isRestricted={!isPremium}
        >
          Export Tools
        </NavLink>
        <NavLink to="/community" icon={Users}>
          Community
        </NavLink>
      </ul>
    </nav>
  );
};

export default Navigation;
