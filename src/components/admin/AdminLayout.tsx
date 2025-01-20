import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

export const AdminLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/admin/auth');
        return;
      }

      const { data: adminProfile } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!adminProfile?.is_active) {
        await supabase.auth.signOut();
        navigate('/admin/auth');
      }
    };

    checkAdminAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};