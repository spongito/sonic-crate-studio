
import { useState } from "react";
import { Link } from "react-router-dom";
import { User, Settings, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Navigation from "./Navigation";
import NavLink from "./NavLink";
import UserSection from "./UserSection";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { signOut, subscription } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Closes sidebar when overlay or X icon clicked
  const handleSidebarClose = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0B0B0B]">
      {/* MOBILE HEADER WITH HAMBURGER */}
      <header className="flex items-center justify-between md:hidden bg-[#12121A] border-b border-white/5 px-4 h-16">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gold to-gold-dark shadow-gold-glow"></div>
          <span className="font-semibold text-lg text-white/90">Assorted Audio</span>
        </Link>
        <button
          className="p-2 text-white/80 focus:outline-none"
          aria-label="Open menu"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-7 w-7" />
        </button>
      </header>

      {/* SIDEBAR: Desktop (always), Mobile (slide-in when open) */}
      <aside
        className={`z-40 bg-[#12121A] border-r border-white/5 shadow-xl
        w-64 fixed top-0 left-0 h-full transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:block md:h-auto md:w-64`}
        style={{ maxWidth: "100vw" }}
        aria-label="Sidebar"
      >
        <div className="flex flex-col h-full">
          {/* CLOSE BUTTON FOR MOBILE */}
          <div className="md:hidden flex justify-end p-3">
            <button
              onClick={handleSidebarClose}
              aria-label="Close menu"
              className="rounded p-1 text-white/70 hover:text-white/100"
            >
              <X className="h-7 w-7" />
            </button>
          </div>
          <Link to="/" className="p-6 flex items-center gap-3 md:pt-6 md:pb-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gold to-gold-dark shadow-gold-glow"></div>
            <span className="font-semibold text-lg text-white/90">Assorted Audio</span>
          </Link>
          <Navigation />

          <div className="border-t border-white/5 my-5"></div>

          <ul className="space-y-2 p-4">
            <NavLink to="/profile" icon={User}>
              Profile
            </NavLink>
            <NavLink to="/settings" icon={Settings}>
              Settings
            </NavLink>
          </ul>

          <div className="mt-auto">
            <UserSection subscription={subscription} onSignOut={signOut} />
          </div>
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          aria-label="Close sidebar overlay"
          onClick={handleSidebarClose}
        />
      )}

      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;

