
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { DebugDashboard } from "@/components/Dashboard/DebugDashboard";
import { useAuth } from "@/context/AuthContext";

export default function Debug() {
  const { user } = useAuth();
  
  // We'll remove the redirect since it's blocking access to the Debug dashboard
  // The DashboardLayout already has authentication checks built in
  
  return (
    <DashboardLayout>
      <DebugDashboard />
    </DashboardLayout>
  );
}
