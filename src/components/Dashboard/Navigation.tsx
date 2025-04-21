
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
  const remainingGenerations = subscription?.remaining_generations || 0;

  return (
    <nav>
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-white/50">
          BROWSE
        </h2>
        <div className="space-y-1">
          <NavLink to="/dashboard" icon={LayoutDashboard}>
            Dashboard
          </NavLink>
          <NavLink to="/playlists" icon={ListMusic}>
            My Playlists
          </NavLink>
          <NavLink to="/music-finder" icon={Music}>
            Music Finder
          </NavLink>
          <NavLink to="/music-finder" icon={PlusCircle}>
            Create Playlist
          </NavLink>
        </div>
      </div>

      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-white/50">
          COMMUNITY
        </h2>
        <div className="space-y-1">
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
            Community Playlists
          </NavLink>
          <NavLink to="/upload" icon={Upload}>
            Upload Playlist
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
