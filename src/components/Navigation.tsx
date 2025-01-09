import { useState, useEffect } from "react";
import { Menu, X, LayoutDashboard } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// PREVIEW ONLY - Remove this function before production deployment
const cleanupUserData = async (userId: string) => {
  if (!userId) return;
  
  try {
    // First, get all service bookings for the user
    const { data: bookings } = await supabase
      .from('service_bookings')
      .select('id')
      .eq('user_id', userId);

    if (bookings) {
      // Delete booking_addons first (they reference booking_rooms)
      for (const booking of bookings) {
        const { data: rooms } = await supabase
          .from('booking_rooms')
          .select('id')
          .eq('booking_id', booking.id);
          
        if (rooms) {
          for (const room of rooms) {
            await supabase
              .from('booking_addons')
              .delete()
              .eq('booking_room_id', room.id);
          }
        }
      }

      // Then delete booking_rooms
      for (const booking of bookings) {
        await supabase
          .from('booking_rooms')
          .delete()
          .eq('booking_id', booking.id);
      }
    }

    // Now we can safely delete service_bookings
    await supabase
      .from('service_bookings')
      .delete()
      .eq('user_id', userId);

    // Delete service preferences
    await supabase
      .from('service_preferences')
      .delete()
      .eq('user_id', userId);

    // Delete properties
    await supabase
      .from('properties')
      .delete()
      .eq('user_id', userId);

    // Sign out the user
    await supabase.auth.signOut();
    
    console.log('Preview cleanup completed');
  } catch (error) {
    console.error('Preview cleanup error:', error);
  }
};

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    // PREVIEW ONLY - Remove this effect before production deployment
    const handleCleanup = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        await cleanupUserData(session.user.id);
      }
    };

    window.addEventListener('beforeunload', handleCleanup);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('beforeunload', handleCleanup);
    };
  }, []);

  const handleBookNow = () => {
    navigate('/auth');
  };

  const handleDashboard = () => {
    navigate('/room-details');
  };

  return (
    <nav className="fixed w-full bg-white/90 dark:bg-purple-dark/90 backdrop-blur-sm z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="text-2xl font-bold text-purple-primary">CleanCo</div>
          
          <div className="flex items-center gap-4">
            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-purple-dark dark:text-white/90 hover:text-purple-primary transition-colors">Services</a>
              <a href="#why-us" className="text-purple-dark dark:text-white/90 hover:text-purple-primary transition-colors">Why Us</a>
              {isAuthenticated ? (
                <button 
                  onClick={handleDashboard}
                  className="flex items-center gap-2 text-purple-dark dark:text-white/90 hover:text-purple-primary transition-colors"
                >
                  <LayoutDashboard size={20} />
                  <span>Dashboard</span>
                </button>
              ) : (
                <button 
                  onClick={handleBookNow}
                  className="bg-purple-primary hover:bg-purple-primary/90 text-white px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                >
                  Book Now
                </button>
              )}
            </div>
            
            <ThemeToggle />
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-purple-primary"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden py-4 animate-fade-in">
            <div className="flex flex-col space-y-4">
              <a href="#services" className="text-purple-dark dark:text-white/90 hover:text-purple-primary transition-colors">Services</a>
              <a href="#why-us" className="text-purple-dark dark:text-white/90 hover:text-purple-primary transition-colors">Why Us</a>
              {isAuthenticated ? (
                <button 
                  onClick={handleDashboard}
                  className="flex items-center gap-2 text-purple-dark dark:text-white/90 hover:text-purple-primary transition-colors"
                >
                  <LayoutDashboard size={20} />
                  <span>Dashboard</span>
                </button>
              ) : (
                <button 
                  onClick={handleBookNow}
                  className="bg-purple-primary hover:bg-purple-primary/90 text-white px-6 py-2 rounded-lg transition-all duration-300 w-full"
                >
                  Book Now
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;