import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export const DevAdminLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const navigate = useNavigate();

  const handleDevLogin = async () => {
    // Check if enough time has passed since the last request (42 seconds)
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    const requiredWaitTime = 42 * 1000; // 42 seconds in milliseconds

    if (timeSinceLastRequest < requiredWaitTime && lastRequestTime !== 0) {
      const remainingSeconds = Math.ceil((requiredWaitTime - timeSinceLastRequest) / 1000);
      toast.error(`Please wait ${remainingSeconds} seconds before requesting another login link`);
      return;
    }

    setIsLoading(true);
    try {
      // Get the nonce from dev_settings
      const { data: devSettings, error: devSettingsError } = await supabase
        .from("dev_settings")
        .select("value")
        .eq("key", "admin_login_nonce")
        .maybeSingle();

      if (devSettingsError) {
        throw new Error("Failed to get dev settings");
      }

      // If no nonce exists, create one
      if (!devSettings) {
        const newNonce = Math.floor(Math.random() * 1000000);
        const { error: insertError } = await supabase
          .from("dev_settings")
          .insert({ key: "admin_login_nonce", value: newNonce.toString() });

        if (insertError) throw new Error("Failed to create nonce");
        
        const email = `AdminTest+${newNonce}@testmail.com`;
        const { error: signInError } = await supabase.auth.signInWithOtp({
          email,
        });

        if (signInError) throw signInError;
      } else {
        const email = `AdminTest+${devSettings.value}@testmail.com`;
        const { error: signInError } = await supabase.auth.signInWithOtp({
          email,
        });

        if (signInError) throw signInError;

        // Update the nonce
        const newNonce = Math.floor(Math.random() * 1000000);
        const { error: updateError } = await supabase
          .from("dev_settings")
          .update({ value: newNonce.toString() })
          .eq("key", "admin_login_nonce");

        if (updateError) {
          console.error("Failed to update nonce:", updateError);
        }
      }

      setLastRequestTime(now);
      toast.success("Check your email for the login link");
      navigate("/auth/admin");
    } catch (error: any) {
      console.error("Dev login error:", error);
      if (error.code === "over_email_send_rate_limit") {
        toast.error("Please wait before requesting another login link");
      } else {
        toast.error("Failed to send login link");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleDevLogin}
      disabled={isLoading}
      className="w-full flex items-center gap-2"
    >
      <Shield className="w-4 h-4" />
      <span>{isLoading ? "Sending Link..." : "Dev Admin Login"}</span>
    </Button>
  );
};