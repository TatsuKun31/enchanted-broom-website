import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { toast } from "sonner";

export const AdminLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/admin/auth');
          return;
        }

        // First check if user exists in auth.users
        const { data: adminProfile, error } = await supabase
          .from('admin_profiles')
          .select('is_active')
          .eq('id', session.user.id)
          .maybeSingle();

        if (error) {
          console.error('Admin profile check error:', error);
          toast.error("Error verifying admin status");
          await supabase.auth.signOut();
          navigate('/admin/auth');
          return;
        }

        // If no admin profile exists, create one
        if (!adminProfile) {
          const { error: insertError } = await supabase
            .from('admin_profiles')
            .insert([{ id: session.user.id, is_active: false }]);

          if (insertError) {
            console.error('Admin profile creation error:', insertError);
            toast.error("Error creating admin profile");
            await supabase.auth.signOut();
            navigate('/admin/auth');
            return;
          }

          toast.error("Your admin account is pending activation");
          await supabase.auth.signOut();
          navigate('/admin/auth');
          return;
        }

        if (!adminProfile.is_active) {
          toast.error("Your admin account is not active");
          await supabase.auth.signOut();
          navigate('/admin/auth');
          return;
        }
      } catch (error) {
        console.error('Admin auth check error:', error);
        toast.error("Authentication error");
        navigate('/admin/auth');
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/admin/auth');
      } else if (event === 'SIGNED_IN') {
        checkAdminAuth();
      }
    });

    checkAdminAuth();

    return () => {
      subscription.unsubscribe();
    };
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