import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export const DevAdminLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleDevLogin = async () => {
    setIsLoading(true);
    try {
      // Get the nonce from dev_settings
      const { data: devSettings, error: devSettingsError } = await supabase
        .from("dev_settings")
        .select("value")
        .eq("key", "admin_login_nonce")
        .single();

      if (devSettingsError || !devSettings) {
        throw new Error("Failed to get dev settings");
      }

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

      toast.success("Check your email for the login link");
      navigate("/auth/admin");
    } catch (error) {
      console.error("Dev login error:", error);
      toast.error("Failed to send login link");
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