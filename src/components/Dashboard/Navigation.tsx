import { Link } from "react-router-dom";
import {
  Music,
  Download,
  Users,
  Sparkles,
  LayoutDashboard,
  ListMusic,
  PlusCircle,
  Upload,
} from "lucide-react";
import NavLink from "./NavLink";
import { useAuth } from "@/context/AuthContext";

const Navigation = () => {
  const { subscription } = useAuth();
  const isPremium = subscription?.is_premium || false;

  return (
    <nav>
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-[9px] font-semibold tracking-widest uppercase text-gray-400">
          BROWSE
        </h2>
        <ul className="space-y-1 list-none p-0 m-0">
          <NavLink to="/dashboard" icon={LayoutDashboard}>
            <span className="text-[12px] font-medium text-white">Dashboard</span>
          </NavLink>
          <NavLink to="/library" icon={Music}>
            <span className="text-[12px] font-medium text-white">Library</span>
          </NavLink>
          <NavLink to="/playlists" icon={ListMusic}>
            <span className="text-[12px] font-medium text-white">My Playlists</span>
          </NavLink>
          <NavLink to="/music-finder" icon={PlusCircle}>
            <span className="text-[12px] font-medium text-white">Create Playlist</span>
          </NavLink>
          <NavLink to="/discover" icon={Sparkles}>
            <span className="text-[12px] font-medium text-white">Discover</span>
          </NavLink>
        </ul>
      </div>

      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-[9px] font-semibold tracking-widest uppercase text-gray-400">
          COMMUNITY
        </h2>
        <ul className="space-y-1 list-none p-0 m-0">
          <NavLink to="/community" icon={Users}>
            <span className="text-[12px] font-medium text-white">Community Playlists</span>
          </NavLink>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
