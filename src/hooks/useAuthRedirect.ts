import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAuthRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const isAdminRoute = location.pathname.startsWith('/admin');
  const checkInProgress = useRef(false);

  useEffect(() => {
    let mounted = true;

    const checkUser = async () => {
      // Prevent multiple simultaneous checks
      if (checkInProgress.current) {
        return;
      }
      
      checkInProgress.current = true;

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Auth check error:', sessionError);
          toast.error("Authentication error. Please try again.");
          if (mounted) {
            setIsLoading(false);
          }
          return;
        }

        // If we're on an auth page and there's no session, just stop loading
        if (!session && location.pathname.includes('/auth')) {
          if (mounted) {
            setIsLoading(false);
          }
          return;
        }

        // If there's no session and we're not on an auth page, redirect
        if (!session) {
          navigate(isAdminRoute ? "/admin/auth" : "/auth");
          if (mounted) {
            setIsLoading(false);
          }
          return;
        }

        // Handle admin routes with a single efficient query
        if (isAdminRoute) {
          const { data: adminProfile, error: adminError } = await supabase
            .from('admin_profiles')
            .select('is_active')
            .eq('id', session.user.id)
            .maybeSingle();

          if (adminError || !adminProfile?.is_active) {
            console.error('Admin access denied:', adminError || 'Inactive admin');
            toast.error("Access denied. Admin privileges required.");
            await supabase.auth.signOut();
            navigate("/admin/auth");
            if (mounted) {
              setIsLoading(false);
            }
            return;
          }

          // Only redirect if we're on the admin auth page
          if (location.pathname === '/admin/auth') {
            navigate("/admin/dashboard");
          }
        } else {
          // For non-admin routes, only redirect if we're on the auth page
          if (location.pathname === '/auth') {
            navigate("/room-details");
          }
        }

        if (mounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        if (mounted) {
          setIsLoading(false);
        }
      } finally {
        checkInProgress.current = false;
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