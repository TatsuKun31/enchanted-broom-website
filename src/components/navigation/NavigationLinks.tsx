import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";

interface NavigationLinksProps {
  isAuthenticated: boolean;
  onNavigate: (sectionId: string) => void;
  onDashboard: () => void;
}

export const NavigationLinks = ({ isAuthenticated, onNavigate, onDashboard }: NavigationLinksProps) => {
  return (
    <div className="hidden md:flex items-center space-x-8">
      <button 
        onClick={() => onNavigate('services')} 
        className="text-purple-dark dark:text-white/90 hover:text-purple-primary transition-colors"
      >
        Services
      </button>
      <button 
        onClick={() => onNavigate('why-us')} 
        className="text-purple-dark dark:text-white/90 hover:text-purple-primary transition-colors"
      >
        Why Us
      </button>
      {isAuthenticated && (
        <button 
          onClick={onDashboard}
          className="flex items-center gap-2 text-purple-dark dark:text-white/90 hover:text-purple-primary transition-colors"
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </button>
      )}
    </div>
  );
};