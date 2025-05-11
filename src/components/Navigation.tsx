import { useState } from "react";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuthButton } from "./auth/AuthButton";
import { MobileMenu } from "./navigation/MobileMenu";
import { NavigationLinks } from "./navigation/NavigationLinks";
import { useAuthState } from "@/hooks/useAuthState";
import { useIsMobile } from "@/hooks/use-mobile";
import logo from "../assets/logo.svg";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuthState();
  const isMobile = useIsMobile();

  const handleAuth = async () => {
    if (isAuthenticated) {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      } catch (error) {
        console.error('Error signing out:', error);
        toast.error("Error signing out. Please try again.");
      }
    } else {
      navigate('/auth');
    }
  };

  const handleDashboard = () => {
    navigate('/dashboard');
  };

  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== '/') {
      navigate('/#' + sectionId);
      return;
    }
    
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  if (isLoading) {
    return (
      <nav className="fixed w-full bg-white/90 dark:bg-purple-dark/90 backdrop-blur-sm z-50 shadow-sm">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex justify-between items-center h-16 px-4">
            <div>
              <img src={logo} alt="Logo" className="h-10" />
            </div>
            <ThemeToggle />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed w-full bg-white/90 dark:bg-purple-dark/90 backdrop-blur-sm z-50 shadow-sm">
        <div className="flex justify-between items-center h-20 px-4">
          <div onClick={() => navigate('/')}>
          <img src={logo} alt="Logo" className="h-18 w-40 ml-3" />
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <NavigationLinks 
              isAuthenticated={isAuthenticated}
              onNavigate={scrollToSection}
              onDashboard={handleDashboard}
            />

            <div className={isMobile ? 'scale-90' : ''}>
              <AuthButton 
                isAuthenticated={isAuthenticated}
                onClick={handleAuth}
              />
            </div>
            
            <div className={isMobile ? 'scale-90' : ''}>
              <ThemeToggle />
            </div>
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-purple-primary"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isOpen && (
          <MobileMenu 
            isAuthenticated={isAuthenticated}
            onNavigate={scrollToSection}
            onDashboard={handleDashboard}
          />
        )}
      
    </nav>
  );
};

export default Navigation;