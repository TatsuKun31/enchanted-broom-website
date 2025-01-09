import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthError } from "@supabase/supabase-js";
import { useState, useEffect } from "react";

export const DevLogin = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentNonce, setCurrentNonce] = useState(0);

  // Load the last used nonce from localStorage
  useEffect(() => {
    const lastNonce = localStorage.getItem('lastNonce');
    if (lastNonce) {
      setCurrentNonce(parseInt(lastNonce));
    }
  }, []);

  const generateTestEmail = (nonce: number): string => {
    const baseEmail = "newtest@testemail.com";
    return nonce === 1 ? baseEmail : `newtest${nonce}@testemail.com`;
  };

  const handleDevLogin = async () => {
    try {
      setIsLoading(true);
      
      // Increment nonce for new account
      const newNonce = currentNonce + 1;
      const testEmail = generateTestEmail(newNonce);
      const testPassword = 'testpassword123';

      // Try to sign up with the email
      const { error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword
      });

      if (signUpError) {
        if (signUpError.message.includes('email_provider_disabled')) {
          toast.error("Email authentication is disabled. Please enable it in Supabase settings.");
          return;
        }
        throw signUpError;
      }

      // Try to sign in with the new account
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });

      if (signInError) {
        throw signInError;
      }

      // Save the successful nonce
      localStorage.setItem('lastNonce', newNonce.toString());
      setCurrentNonce(newNonce);
      
      toast.success(`Logged in as ${testEmail}`);
      navigate("/room-details");
    } catch (error) {
      console.error("Dev login error:", error);
      if (error instanceof AuthError) {
        toast.error(error.message);
      } else {
        toast.error("Dev login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-4 border-t">
      <Button 
        onClick={handleDevLogin}
        variant="outline"
        className="w-full"
        disabled={isLoading}
      >
        Dev Login (New Test Account)
      </Button>
      
      {isLoading && (
        <p className="text-sm text-muted-foreground mt-2 text-center">
          Creating new test account...
        </p>
      )}
    </div>
  );
};