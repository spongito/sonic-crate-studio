
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { LibraryMain } from "@/components/Library/LibraryMain";
import { TracksProvider } from "@/context/TracksContext";

const Library = () => {
  return (
    <DashboardLayout>
      <TracksProvider>
        <LibraryMain />
      </TracksProvider>
    </DashboardLayout>
  );
};

export default Library;
