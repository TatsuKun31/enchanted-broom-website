import { useState, useEffect } from "react";
import { Menu, X, LayoutDashboard } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { cleanupUserData } from "@/utils/previewCleanup";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AuthButton } from "./auth/AuthButton";
import { MobileMenu } from "./navigation/MobileMenu";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session error:', error);
          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(checkAuth, 1000 * retryCount); // Exponential backoff
            return;
          }
          setIsAuthenticated(false);
          toast.error("Authentication error. Please try logging in again.");
          return;
        }
        if (mounted) {
          setIsAuthenticated(!!session);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      try {
        setIsAuthenticated(!!session);
        
        if (event === 'SIGNED_OUT') {
          try {
            if (session?.user?.id) {
              await cleanupUserData(session.user.id);
              queryClient.clear();
            }
          } catch (error) {
            console.error('Cleanup error:', error);
          } finally {
            navigate('/auth');
          }
        } else if (event === 'TOKEN_REFRESHED') {
          setIsAuthenticated(true);
        } else if (event === 'USER_UPDATED') {
          setIsAuthenticated(!!session);
        } else if (event === 'SIGNED_IN') {
          // Ensure we have a valid session before proceeding
          const { data: { session: currentSession }, error } = await supabase.auth.getSession();
          if (error) {
            throw error;
          }
          if (currentSession) {
            setIsAuthenticated(true);
            if (location.pathname === '/auth') {
              navigate('/');
            }
          }
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        toast.error("Authentication error. Please try logging in again.");
        setIsAuthenticated(false);
        navigate('/auth');
      }
    });

    // Initial auth check
    checkAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, queryClient, location.pathname]);

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
    navigate('/room-details');
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
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="text-2xl font-bold text-purple-primary">
              The Enchanted Broom
            </div>
            <ThemeToggle />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed w-full bg-white/90 dark:bg-purple-dark/90 backdrop-blur-sm z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div 
            className="text-2xl font-bold text-purple-primary cursor-pointer" 
            onClick={() => navigate('/')}
          >
            The Enchanted Broom
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('services')} 
                className="text-purple-dark dark:text-white/90 hover:text-purple-primary transition-colors"
              >
                Services
              </button>
              <button 
                onClick={() => scrollToSection('why-us')} 
                className="text-purple-dark dark:text-white/90 hover:text-purple-primary transition-colors"
              >
                Why Us
              </button>
              {isAuthenticated && (
                <button 
                  onClick={handleDashboard}
                  className="flex items-center gap-2 text-purple-dark dark:text-white/90 hover:text-purple-primary transition-colors"
                >
                  <LayoutDashboard size={20} />
                  <span>Dashboard</span>
                </button>
              )}
            </div>

            <AuthButton 
              isAuthenticated={isAuthenticated}
              onClick={handleAuth}
            />
            
            <ThemeToggle />
            
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
      </div>
    </nav>
  );
};

export default Navigation;
