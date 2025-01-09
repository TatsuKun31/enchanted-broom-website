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

  const checkUserExists = async (email: string) => {
    const { data, error } = await supabase.auth.admin.listUsers({
      filters: {
        email: email
      }
    });
    
    if (error) {
      console.error("Error checking user existence:", error);
      return false;
    }
    
    return data?.users?.length > 0;
  };

  const findNextAvailableEmail = async (startNumber: number): Promise<{ email: string; number: number }> => {
    let testNumber = startNumber;
    let userExists = true;
    
    while (userExists) {
      const testEmail = `test${testNumber}@example.com`;
      userExists = await checkUserExists(testEmail);
      
      if (!userExists) {
        return { email: testEmail, number: testNumber };
      }
      testNumber++;
    }
    
    // This should never be reached due to the while loop
    throw new Error("Could not find available email");
  };

  const handleDevLogin = async () => {
    try {
      const nextTestNumber = currentTestNumber + 1;
      const { email: availableEmail, number: finalTestNumber } = await findNextAvailableEmail(nextTestNumber);
      const testPassword = 'testpassword123';

      // Try to sign up with the new available email
      const { error: signUpError } = await supabase.auth.signUp({
        email: availableEmail,
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
        email: availableEmail,
        password: testPassword
      });

      if (signInError) {
        throw signInError;
      }

      // Save the new test number to localStorage
      localStorage.setItem('lastTestNumber', finalTestNumber.toString());
      setCurrentTestNumber(finalTestNumber);
      
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