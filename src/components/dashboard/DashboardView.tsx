import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardStats } from "./DashboardStats";
import { DashboardTabs } from "./DashboardTabs";

interface DashboardViewProps {
  userData: {
    name: string;
    propertyType: string;
    frequency: string;
    nextService?: string;
  };
}

export const DashboardView = ({ userData }: DashboardViewProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      }
    };

    checkAuth();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/auth");
    } catch (error) {
      toast.error("Error signing out");
      console.error("Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-24">
        <DashboardHeader userName={userData.name} onSignOut={handleSignOut} />
        <DashboardStats 
          nextService={userData.nextService}
          frequency={userData.frequency}
          propertyType={userData.propertyType}
        />
        <DashboardTabs />
      </div>
    </div>
  );
};