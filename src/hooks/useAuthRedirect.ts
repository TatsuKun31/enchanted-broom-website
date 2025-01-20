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
      if (checkInProgress.current) return;
      checkInProgress.current = true;

      try {
        const { data: { session } } = await supabase.auth.getSession();

        // If we're on an auth page and there's no session, just stop loading
        if (!session && location.pathname.includes('/auth')) {
          if (mounted) setIsLoading(false);
          checkInProgress.current = false;
          return;
        }

        // If there's no session and we're not on an auth page, redirect
        if (!session) {
          navigate(isAdminRoute ? "/admin/auth" : "/auth");
          if (mounted) setIsLoading(false);
          checkInProgress.current = false;
          return;
        }

        // For admin routes, check admin status
        if (isAdminRoute) {
          const { data: adminProfile, error: adminError } = await supabase
            .from('admin_profiles')
            .select('is_active')
            .eq('id', session.user.id)
            .maybeSingle();

          if (adminError) {
            console.error('Admin check error:', adminError);
            if (mounted) {
              toast.error("Error verifying admin status");
              await supabase.auth.signOut();
              navigate("/admin/auth");
            }
            return;
          }

          if (!adminProfile) {
            if (mounted) {
              toast.error("No admin profile found");
              await supabase.auth.signOut();
              navigate("/admin/auth");
            }
            return;
          }

          if (!adminProfile.is_active) {
            if (mounted) {
              toast.error("Your admin account is not active");
              await supabase.auth.signOut();
              navigate("/admin/auth");
            }
            return;
          }

          // Only redirect if we're on the admin auth page
          if (location.pathname === '/admin/auth') {
            navigate("/admin/dashboard");
          }
        } else {
          // For non-admin routes, redirect if on auth page
          if (location.pathname === '/auth') {
            navigate("/room-details");
          }
        }

        if (mounted) setIsLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        if (mounted) {
          toast.error("Authentication error occurred");
          setIsLoading(false);
        }
      } finally {
        checkInProgress.current = false;
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (!mounted) return;
      
      if (event === 'SIGNED_IN') {
        checkUser();
      } else if (event === 'SIGNED_OUT') {
        if (isAdminRoute) {
          navigate('/admin/auth');
        } else {
          navigate('/auth');
        }
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