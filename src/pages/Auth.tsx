import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LoadingScreen } from "@/components/LoadingScreen";
import { supabase } from "@/integrations/supabase/client";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { DevLogin } from "@/components/auth/DevLogin";
import { DevAdminLogin } from "@/components/auth/DevAdminLogin";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth check error:', error);
          if (mounted) {
            setIsLoading(false);
          }
          return;
        }

        if (mounted && session && location.pathname !== "/admin/auth") {
          try {
            const { data: adminProfile, error: adminError } = await supabase
              .from('admin_profiles')
              .select('is_active')
              .eq('id', session.user.id)
              .single();

            if (adminError) {
              console.error('Admin profile check error:', adminError);
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
        } else if (mounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkUser();

    return () => {
      mounted = false;
    };
  }, [navigate, location.pathname]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  const handleAdminSignIn = () => {
    navigate("/admin/auth");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email to sign in to your account
          </p>
        </div>

        <div className="space-y-4">
          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "rgb(147, 51, 234)",
                    brandAccent: "rgb(126, 34, 206)",
                  },
                },
              },
            }}
            providers={[]}
          />
          
          <div className="space-y-4">
            <DevLogin />
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Admin Access
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleAdminSignIn}
              className="w-full flex items-center gap-2"
              type="button"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Sign In</span>
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Development Only
                </span>
              </div>
            </div>

            <DevAdminLogin />
          </div>
        </div>
      </div>
    </div>
  );
}