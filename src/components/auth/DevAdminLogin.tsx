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
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: 'admin@test.com',
        password: 'admintest123',
      });

      if (signInError) throw signInError;

      toast.success("Successfully logged in as admin");
      navigate("/admin/dashboard");
    } catch (error: any) {
      console.error("Dev admin login error:", error);
      toast.error("Failed to login. Please try again.");
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
      <span>{isLoading ? "Logging in..." : "Dev Admin Login"}</span>
    </Button>
  );
};