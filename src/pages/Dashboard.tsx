import Navigation from "@/components/Navigation";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Dashboard = () => {
  const navigate = useNavigate();

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      }
    };
    checkAuth();
  }, [navigate]);

  // Fetch user data
  const { data: userData, isLoading } = useQuery({
    queryKey: ['userData'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const [profileResponse, propertyResponse, preferencesResponse] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle(),
        supabase
          .from('properties')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('service_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
      ]);

      return {
        name: profileResponse.data?.name || '',
        propertyType: propertyResponse.data?.property_type || '',
        frequency: preferencesResponse.data?.frequency || '',
      };
    },
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!userData) {
    navigate("/room-details");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-purple-dark/20 dark:to-purple-dark/40">
      <Navigation />
      <DashboardView userData={userData} />
    </div>
  );
};

export default Dashboard;