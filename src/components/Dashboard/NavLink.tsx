
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface NavLinkProps {
  to: string;
  icon: LucideIcon;
  children: React.ReactNode;
  isPremium?: boolean;
}

const NavLink = ({ to, icon: Icon, children, isPremium }: NavLinkProps) => {
  return (
    <li>
      <Link 
        to={to} 
        className="group flex items-center gap-3 px-3 py-3 rounded-lg sidebar-item"
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
  );
};

export default NavLink;
