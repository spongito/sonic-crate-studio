
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

const Navigation = () => {
  return (
    <nav className="p-4">
      <ul className="space-y-2">
        <NavLink to="/dashboard" icon={LayoutDashboard}>
          Dashboard
        </NavLink>
        <NavLink to="/music-finder" icon={Music}>
          Music Finder
        </NavLink>
        <NavLink to="/curation-assistant" icon={Sparkles}>
          Curation Assistant
        </NavLink>
        <NavLink to="/playlists" icon={ListMusic}>
          My Playlists
        </NavLink>
        <NavLink to="/export" icon={Download} isPremium>
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
