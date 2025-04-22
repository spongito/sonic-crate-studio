
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { PlaylistList } from "@/components/Playlists/PlaylistList";

const Playlists = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <PlaylistList />
      </div>
    </DashboardLayout>
  );
};

export default Playlists;
