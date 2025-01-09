import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cleanupUserData } from "@/utils/previewCleanup";

export const useAuthState = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
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
            setTimeout(checkAuth, 1000 * retryCount);
            return;
          }
          if (mounted) {
            setIsAuthenticated(false);
          }
          toast.error("Authentication error. Please try logging in again.");
          return;
        }
        if (mounted) {
          setIsAuthenticated(!!session);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        if (mounted) {
          setIsAuthenticated(false);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Auth state change:', event, !!session);

      try {
        if (event === 'SIGNED_OUT') {
          if (session?.user?.id) {
            await cleanupUserData(session.user.id);
            queryClient.clear();
          }
          setIsAuthenticated(false);
          navigate('/');
        } else if (event === 'SIGNED_IN') {
          setIsAuthenticated(true);
        } else if (event === 'TOKEN_REFRESHED') {
          setIsAuthenticated(true);
        } else if (event === 'USER_UPDATED') {
          setIsAuthenticated(!!session);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        toast.error("Authentication error. Please try logging in again.");
        setIsAuthenticated(false);
        navigate('/auth');
      }
    });

    checkAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, queryClient]);

  return { isAuthenticated, isLoading };
};