import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthError } from "@supabase/supabase-js";
import { useState, useEffect } from "react";

export const DevLogin = () => {
  const navigate = useNavigate();
  const [currentTestNumber, setCurrentTestNumber] = useState(0);

  // Load the last used test number from localStorage
  useEffect(() => {
    const lastTestNumber = localStorage.getItem('lastTestNumber');
    if (lastTestNumber) {
      setCurrentTestNumber(parseInt(lastTestNumber));
    }
  }, []);

  const handleDevLogin = async () => {
    try {
      const nextTestNumber = currentTestNumber + 1;
      const testEmail = `test${nextTestNumber}@example.com`;
      const testPassword = 'testpassword123';

      // Try to sign up with the new incremental email
      const { error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword
      });

      if (signUpError) {
        if (signUpError.message.includes('email_provider_disabled')) {
          toast.error("Email authentication is disabled. Please enable it in Supabase settings.");
        } else {
          throw signUpError;
        }
        return;
      }

      // If signup successful, try to sign in immediately
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });

      if (signInError) {
        throw signInError;
      }

      // Save the new test number to localStorage
      localStorage.setItem('lastTestNumber', nextTestNumber.toString());
      setCurrentTestNumber(nextTestNumber);
      
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

  return (
    <div className="pt-4 border-t">
      <Button 
        onClick={handleDevLogin}
        variant="outline"
        className="w-full"
      >
        Dev Login (New Test Account)
      </Button>
    </div>
  );
};