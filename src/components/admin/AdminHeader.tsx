import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { LogOut, Settings } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export const AdminHeader = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/admin/auth');
  };

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4 gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-purple-primary">Admin Dashboard</h2>
        </div>
        <ThemeToggle />
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleSignOut}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};