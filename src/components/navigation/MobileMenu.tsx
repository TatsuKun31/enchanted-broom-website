import { LayoutDashboard } from "lucide-react";

interface MobileMenuProps {
  isAuthenticated: boolean;
  onNavigate: (section: string) => void;
  onDashboard: () => void;
}

export const MobileMenu = ({ isAuthenticated, onNavigate, onDashboard }: MobileMenuProps) => {
  return (
    <div className="md:hidden py-4 animate-fade-in">
      <div className="flex flex-col space-y-4">
        <button 
          onClick={() => onNavigate('services')}
          className="text-purple-dark dark:text-white/90 hover:text-purple-primary transition-colors text-left"
        >
          Services
        </button>
        <button 
          onClick={() => onNavigate('why-us')}
          className="text-purple-dark dark:text-white/90 hover:text-purple-primary transition-colors text-left"
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
    </div>
  );
};