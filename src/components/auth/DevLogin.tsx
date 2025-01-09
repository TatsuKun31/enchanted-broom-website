import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthError } from "@supabase/supabase-js";

export const DevLogin = () => {
  const navigate = useNavigate();
  const isDevelopment = import.meta.env.DEV;

  const handleDevLogin = async () => {
    try {
      // Try to sign in first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'testpassword123'
      });

      // If sign in fails with invalid_credentials, try to sign up
      if (signInError && signInError.message.includes('Invalid login credentials')) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: 'test@example.com',
          password: 'testpassword123'
        });

        if (signUpError) {
          // Handle specific signup errors
          if (signUpError.message.includes('User already registered')) {
            toast.error("Test user exists but credentials might be wrong. Please check Supabase settings.");
          } else if (signUpError.message.includes('email_provider_disabled')) {
            toast.error("Email authentication is disabled. Please enable it in Supabase settings.");
          } else {
            throw signUpError;
          }
          return;
        }
      } else if (signInError) {
        // Handle other sign in errors
        if (signInError.message.includes('email_provider_disabled')) {
          toast.error("Email authentication is disabled. Please enable it in Supabase settings.");
          return;
        }
        throw signInError;
      }
      
      navigate("/room-details");
    } catch (error) {
      if (error instanceof AuthError) {
        toast.error(error.message);
      } else {
        toast.error("Dev login failed. Please try again.");
      }
      console.error("Dev login error:", error);
    }
  };

  if (!isDevelopment) return null;

  return (
    <div className="pt-4 border-t">
      <Button 
        onClick={handleDevLogin}
        variant="outline"
        className="w-full"
      >
        Dev Login (test@example.com)
      </Button>
    </div>
  );
};