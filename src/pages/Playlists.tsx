
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { PlaylistList } from "@/components/Playlists/PlaylistList";

const Playlists = () => {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">My Playlists</h1>
        <PlaylistList />
      </div>
    </DashboardLayout>
  );
};

export default Playlists;
