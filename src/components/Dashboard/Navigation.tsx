
import { Link } from "react-router-dom";
import { 
  Music, 
  Download, 
  Users, 
  Sparkles,
  LayoutDashboard,
  ListMusic,
  PlusCircle,
  Upload
} from "lucide-react";
import NavLink from "./NavLink";
import { useAuth } from "@/context/AuthContext";

const Navigation = () => {
  const { subscription } = useAuth();
  const isPremium = subscription?.is_premium || false;

  return (
    <nav>
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-[10px] font-semibold tracking-tight text-white/50">
          BROWSE
        </h2>
        <div className="space-y-1">
          <NavLink to="/dashboard" icon={LayoutDashboard}>
            <span className="text-sm">Dashboard</span>
          </NavLink>
          <NavLink to="/playlists" icon={ListMusic}>
            <span className="text-sm">My Playlists</span>
          </NavLink>
          <NavLink to="/music-finder" icon={Music}>
            <span className="text-sm">Music Finder</span>
          </NavLink>
          <NavLink to="/music-finder" icon={PlusCircle}>
            <span className="text-sm">Create Playlist</span>
          </NavLink>
        </div>
      </div>

      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-[10px] font-semibold tracking-tight text-white/50">
          COMMUNITY
        </h2>
        <div className="space-y-1">
          <NavLink 
            to="/curation-assistant" 
            icon={Sparkles}
            isPremium={true}
            isRestricted={!isPremium}
          >
            <span className="text-sm">Curation Assistant</span>
          </NavLink>
          <NavLink 
            to="/export" 
            icon={Download} 
            isPremium={true}
            isRestricted={!isPremium}
          >
            <span className="text-sm">Export Tools</span>
          </NavLink>
          <NavLink to="/community" icon={Users}>
            <span className="text-sm">Community Playlists</span>
          </NavLink>
          <NavLink to="/upload" icon={Upload}>
            <span className="text-sm">Upload Playlist</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

