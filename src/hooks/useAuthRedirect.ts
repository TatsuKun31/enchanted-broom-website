import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAuthRedirect = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

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

        if (mounted && session) {
          try {
            // Check if user is an admin
            const { data: adminProfile, error: adminError } = await supabase
              .from('admin_profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            if (adminError) {
              console.error('Admin profile check error:', adminError);
              toast.error("Error checking admin status. Redirecting to default route.");
              navigate("/room-details");
              return;
            }

            if (adminProfile?.is_active) {
              navigate("/admin/dashboard");
            } else {
              navigate("/room-details");
            }
          } catch (error) {
            console.error('Admin check error:', error);
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
  }, [navigate]);

  return { isLoading };
};