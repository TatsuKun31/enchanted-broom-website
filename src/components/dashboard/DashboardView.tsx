import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardStats } from "./DashboardStats";
import { DashboardTabs } from "./DashboardTabs";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      }
    };
    checkAuth();
  }, [navigate]);

  // Fetch next service using React Query
  const { data: nextService } = useQuery({
    queryKey: ['nextService'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return undefined;

      const { data: bookings, error } = await supabase
        .from("service_bookings")
        .select("booking_date, time_slot")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .gte("booking_date", new Date().toISOString().split('T')[0])
        .order("booking_date", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching next service:", error);
        return undefined;
      }

      if (bookings) {
        const timeSlotMap = {
          morning: "9:00 AM - 11:00 AM",
          midday: "12:00 PM - 2:00 PM",
          afternoon: "3:00 PM - 5:00 PM",
        };
        
        return `${format(new Date(bookings.booking_date), 'MMMM do, yyyy')} at ${timeSlotMap[bookings.time_slot as keyof typeof timeSlotMap]}`;
      }

      return undefined;
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Fetch user's complete profile data
  const { data: completeUserData } = useQuery({
    queryKey: ['completeUserData'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const [profileResponse, propertyResponse, preferencesResponse] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single(),
        supabase
          .from('properties')
          .select('*')
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('service_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single(),
      ]);

      return {
        name: profileResponse.data?.name || '',
        phone: profileResponse.data?.phone || '',
        propertyType: propertyResponse.data?.property_type || '',
        address: propertyResponse.data?.address || '',
        frequency: preferencesResponse.data?.frequency || '',
      };
    },
  });

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

  const handleProfileUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['completeUserData'] });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-24">
        <DashboardHeader 
          userName={userData.name} 
          onSignOut={handleSignOut}
          userData={completeUserData || {
            name: userData.name,
            phone: '',
            propertyType: userData.propertyType,
            address: '',
            frequency: userData.frequency,
          }}
          onUpdate={handleProfileUpdate}
        />
        <DashboardStats 
          nextService={nextService}
          frequency={userData.frequency}
          propertyType={userData.propertyType}
        />
        <DashboardTabs />
      </div>
    </div>
  );
};