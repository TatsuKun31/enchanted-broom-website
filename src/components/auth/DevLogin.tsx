import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthError } from "@supabase/supabase-js";
import { useState, useEffect } from "react";

export const DevLogin = () => {
  const navigate = useNavigate();
  const [currentTestNumber, setCurrentTestNumber] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  // Load the last used test number from localStorage
  useEffect(() => {
    const lastTestNumber = localStorage.getItem('lastTestNumber');
    if (lastTestNumber) {
      setCurrentTestNumber(parseInt(lastTestNumber));
    }
  }, []);

  const findNextAvailableEmail = async (startNumber: number): Promise<{ email: string; number: number }> => {
    let testNumber = startNumber;
    let maxAttempts = 100; // Prevent infinite loops
    let attempts = 0;

    while (attempts < maxAttempts) {
      setAttemptCount(attempts + 1);
      const testEmail = `test${testNumber}@example.com`;
      
      try {
        const { data: { user }, error } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: 'wrong-password'
        });

        // If no error or user exists, increment and continue
        if (!error || user) {
          testNumber++;
          attempts++;
          continue;
        }

        // If error indicates invalid credentials, the email exists
        if (error.message.includes('Invalid login credentials')) {
          testNumber++;
          attempts++;
          continue;
        }

        // If we get here, the email might be available
        return { email: testEmail, number: testNumber };
      } catch {
        // On any error, try the next number
        testNumber++;
        attempts++;
      }
    }
    
    throw new Error("Could not find available email after maximum attempts");
  };

  const handleDevLogin = async () => {
    try {
      setIsSearching(true);
      setAttemptCount(0);
      
      const nextTestNumber = currentTestNumber + 1;
      const { email: availableEmail, number: finalTestNumber } = await findNextAvailableEmail(nextTestNumber);
      const testPassword = 'testpassword123';

      // Try to sign up with the email
      const { error: signUpError } = await supabase.auth.signUp({
        email: availableEmail,
        password: testPassword
      });

      if (signUpError) {
        if (signUpError.message.includes('email_provider_disabled')) {
          toast.error("Email authentication is disabled. Please enable it in Supabase settings.");
          return;
        }
        
        if (signUpError.message.includes('user_already_exists')) {
          // If user was created between our check and signup, try the next number
          localStorage.setItem('lastTestNumber', finalTestNumber.toString());
          setCurrentTestNumber(finalTestNumber);
          handleDevLogin(); // Retry with next number
          return;
        }
        
        throw signUpError;
      }

      // Try to sign in with the new account
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: availableEmail,
        password: testPassword
      });

      if (signInError) {
        throw signInError;
      }

      // Save the successful test number
      localStorage.setItem('lastTestNumber', finalTestNumber.toString());
      setCurrentTestNumber(finalTestNumber);
      
      toast.success(`Logged in as ${availableEmail}`);
      navigate("/room-details");
    } catch (error) {
      console.error("Dev login error:", error);
      if (error instanceof AuthError) {
        toast.error(error.message);
      } else {
        toast.error("Dev login failed. Please try again.");
      }
    } finally {
      setIsSearching(false);
      setAttemptCount(0);
    }
  };

  return (
    <div className="pt-4 border-t">
      <Button 
        onClick={handleDevLogin}
        variant="outline"
        className="w-full"
        disabled={isSearching}
      >
        Dev Login (New Test Account)
      </Button>
      
      {isSearching && (
        <p className="text-sm text-muted-foreground mt-2 text-center">
          Finding available email... (Attempt {attemptCount})
        </p>
      )}
    </div>
  );
};