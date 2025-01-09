import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const DevLogin = () => {
  const navigate = useNavigate();
  const isDevelopment = import.meta.env.DEV;

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