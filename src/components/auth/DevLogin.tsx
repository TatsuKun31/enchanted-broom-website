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

  const checkUserExists = async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: 'wrong-password-to-check-existence'
      });

      // These specific error messages indicate the user exists
      return error?.message.includes('Invalid login credentials') || 
             error?.message.includes('Email not confirmed');
    } catch {
      // Silently fail and assume user doesn't exist
      return false;
    }
  };

  const findNextAvailableEmail = async (startNumber: number): Promise<{ email: string; number: number }> => {
    let testNumber = startNumber;
    let maxAttempts = 100;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      setAttemptCount(attempts + 1);
      const testEmail = `test${testNumber}@example.com`;
      
      try {
        const userExists = await checkUserExists(testEmail);
        if (!userExists) {
          return { email: testEmail, number: testNumber };
        }
      } catch {
        // Silently continue to next attempt
      }
      
      testNumber++;
      attempts++;
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

      const { error: signUpError } = await supabase.auth.signUp({
        email: availableEmail,
        password: testPassword
      });

      if (signUpError) {
        if (signUpError.message.includes('email_provider_disabled')) {
          toast.error("Email authentication is disabled. Please enable it in Supabase settings.");
          return;
        }
        
        throw signUpError;
      }

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
      
      toast.success(`Logged in as ${availableEmail}`);
      navigate("/room-details");
    } catch (error) {
      if (error instanceof AuthError) {
        toast.error(error.message);
      } else {
        toast.error("Dev login failed. Please try again.");
      }
      console.error("Dev login error:", error);
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