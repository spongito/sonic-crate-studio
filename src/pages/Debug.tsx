
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { DebugDashboard } from "@/components/Dashboard/DebugDashboard";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

export default function Debug() {
  const { user } = useAuth();
  
  // Only allow access to authenticated users
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <DashboardLayout>
      <DebugDashboard />
    </DashboardLayout>
  );
}
