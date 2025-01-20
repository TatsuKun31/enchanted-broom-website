import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, DollarSign, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { PriceAdjustmentModal } from "@/components/admin/PriceAdjustmentModal";

const AdminDashboard = () => {
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      // Get total users count
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get total bookings count
      const { count: bookingsCount } = await supabase
        .from('service_bookings')
        .select('*', { count: 'exact', head: true });

      // Get total revenue
      const { data: bookings } = await supabase
        .from('service_bookings')
        .select('total_price');

      const totalRevenue = bookings?.reduce((sum, booking) => sum + Number(booking.total_price), 0) || 0;

      // Get completed bookings count
      const { count: completedCount } = await supabase
        .from('service_bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      return {
        usersCount: usersCount || 0,
        bookingsCount: bookingsCount || 0,
        totalRevenue,
        completedCount: completedCount || 0
      };
    }
  });

  const { data: chartData, isLoading: isChartLoading } = useQuery({
    queryKey: ['bookingsChart'],
    queryFn: async () => {
      const { data: bookings } = await supabase
        .from('service_bookings')
        .select('booking_date, total_price')
        .order('booking_date', { ascending: true })
        .limit(7);

      return bookings?.map(booking => ({
        date: new Date(booking.booking_date).toLocaleDateString(),
        amount: Number(booking.total_price)
      })) || [];
    }
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <Button onClick={() => setIsPriceModalOpen(true)}>
          Adjust Service Prices
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isStatsLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats?.usersCount}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Services</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isStatsLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats?.bookingsCount}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isStatsLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                ${stats?.totalRevenue.toFixed(2)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Services</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isStatsLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats?.completedCount}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          {isChartLoading ? (
            <div className="w-full h-[300px] flex items-center justify-center">
              <Skeleton className="h-[250px] w-full" />
            </div>
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <PriceAdjustmentModal 
        isOpen={isPriceModalOpen}
        onClose={() => setIsPriceModalOpen(false)}
      />
    </div>
  );
};

export default AdminDashboard;