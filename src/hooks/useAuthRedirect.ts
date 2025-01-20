import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAuthRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth check error:', error);
          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(checkUser, 1000 * retryCount);
            return;
          }
          toast.error("Authentication error. Please try again.");
          setIsLoading(false);
          return;
        }

        if (!mounted) return;

        if (!session) {
          // Only redirect to /auth if we're not already on an auth page
          if (!location.pathname.includes('/auth')) {
            navigate(isAdminRoute ? "/admin/auth" : "/auth");
          }
          setIsLoading(false);
          return;
        }

        // If we have a session, handle the routing
        try {
          // Check for admin status if on admin route
          if (isAdminRoute) {
            const { data: adminProfile, error: adminError } = await supabase
              .from('admin_profiles')
              .select('is_active')
              .eq('id', session.user.id)
              .single();

            if (adminError || !adminProfile?.is_active) {
              console.error('Admin profile check error:', adminError);
              toast.error("Access denied. Admin privileges required.");
              navigate("/auth");
              return;
            }

            if (location.pathname === '/admin/auth') {
              navigate("/admin/dashboard");
            }
          } else {
            // For non-admin routes
            if (location.pathname === '/auth') {
              navigate("/room-details");
            }
          }
        } catch (error) {
          console.error('Route check error:', error);
          navigate(isAdminRoute ? "/admin/auth" : "/auth");
        }
        
        if (mounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === "SIGNED_IN" && session) {
        checkUser();
      }
    });

    checkUser();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, isAdminRoute, location.pathname]);

  return { isLoading };
};