
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import UpgradeModal from "./UpgradeModal";

interface NavLinkProps {
  to: string;
  icon: LucideIcon;
  children: React.ReactNode;
  isPremium?: boolean;
  isRestricted?: boolean;
}

const NavLink = ({ to, icon: Icon, children, isPremium, isRestricted }: NavLinkProps) => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const handleClick = (e: React.MouseEvent) => {
    if (isRestricted) {
      e.preventDefault();
      setShowUpgradeModal(true);
    }
  };
  
  return (
    <>
      <li>
        <Link 
          to={to} 
          className="group flex items-center gap-3 px-3 py-3 rounded-lg sidebar-item"
          onClick={handleClick}
        >
          <Icon className="h-5 w-5 sidebar-item-icon" />
          <span>{children}</span>
          {isPremium && (
            <span className="ml-auto text-xs bg-gold text-black px-2 py-0.5 rounded-full font-medium">
              Pro
            </span>
          )}
        </Link>
      </li>
      
      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </>
  );
};

export default NavLink;
