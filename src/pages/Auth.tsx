import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const isDevelopment = import.meta.env.DEV;

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/room-details");
      }
      setIsLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        navigate("/room-details");
      }
    });

    checkUser();

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleDevLogin = async () => {
    try {
      // First try to create the test account if it doesn't exist
      const { error: signUpError } = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'testpassword123'
      });

      if (signUpError) {
        if (signUpError.message.includes('email_provider_disabled')) {
          toast.error("Email authentication is disabled. Please enable it in Supabase settings.");
          return;
        }
      }

      // Attempt to sign in regardless of whether sign up succeeded
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'testpassword123'
      });

      if (signInError) {
        if (signInError.message.includes('email_provider_disabled')) {
          toast.error("Email authentication is disabled. Please enable it in Supabase settings.");
          return;
        }
        throw signInError;
      }
      
      navigate("/room-details");
    } catch (error) {
      toast.error("Dev login failed. Please try again.");
      console.error("Dev login error:", error);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-50 dark:bg-purple-dark/20">
      <Card className="w-[90%] max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-purple-dark dark:text-purple-secondary">
            Welcome to Cleaning Services
          </CardTitle>
          <CardDescription className="text-center">
            Sign in or create an account to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SupabaseAuth 
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#8B5CF6',
                    brandAccent: '#7C3AED',
                    inputBackground: 'white',
                    inputText: 'black',
                    inputBorder: '#E5E7EB',
                    inputBorderFocus: '#8B5CF6',
                    inputBorderHover: '#8B5CF6',
                    inputPlaceholder: '#9CA3AF',
                  }
                }
              },
              style: {
                input: {
                  backgroundColor: 'var(--background)',
                  color: 'var(--foreground)',
                  borderColor: 'var(--border)',
                },
                anchor: {
                  color: 'var(--primary)',
                  textDecoration: 'none',
                },
                button: {
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                },
              },
            }}
            providers={["google"]}
          />
          {isDevelopment && (
            <div className="pt-4 border-t">
              <Button 
                onClick={handleDevLogin}
                variant="outline"
                className="w-full"
              >
                Dev Login (test@example.com)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;