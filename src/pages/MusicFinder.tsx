
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { PlaylistGeneratorPanel } from "@/components/PlaylistGenerator/PlaylistGeneratorPanel";

const MusicFinder = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <PlaylistGeneratorPanel />
      </div>
    </DashboardLayout>
  );
};

export default MusicFinder;
