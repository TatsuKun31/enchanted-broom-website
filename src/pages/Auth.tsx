import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DevLogin } from "@/components/auth/DevLogin";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

const Auth = () => {
  const { isLoading } = useAuthRedirect();

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
        <CardContent>
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