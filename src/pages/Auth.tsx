import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { DevLogin } from "@/components/auth/DevLogin";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Auth = () => {
  const { isLoading } = useAuthRedirect();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setError(null);
      }
      
      if (event === 'SIGNED_IN' && !session) {
        setError('Session invalid. Please try again.');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-purple-dark/20 dark:to-purple-dark/40 p-4">
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 flex items-center gap-2 text-purple-primary hover:text-purple-primary/80"
      >
        <ArrowLeft className="h-4 w-4" />
        Return to Home Page
      </Button>
      
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome</CardTitle>
          <CardDescription className="text-center">
            Sign in or create an account to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-4">
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
            <DevLogin />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;