import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthError } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'testpassword123'
      });

      if (error) throw error;
      navigate("/room-details");
    } catch (error) {
      toast.error("Dev login failed. Make sure to create a test account first.");
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
                  backgroundColor: 'var(--colors-inputBackground)',
                  color: 'var(--colors-inputText)',
                  borderColor: 'var(--colors-inputBorder)',
                },
                anchor: {
                  color: 'var(--colors-brand)',
                  '&:hover': {
                    color: 'var(--colors-brandAccent)',
                  },
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