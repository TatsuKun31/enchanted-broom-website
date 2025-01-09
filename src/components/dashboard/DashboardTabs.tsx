import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UpcomingServiceCard } from "./UpcomingServiceCard";

export const DashboardTabs = () => {
  const { data: upcomingServices } = useQuery({
    queryKey: ["upcomingServices"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: bookings, error } = await supabase
        .from("service_bookings")
        .select(`
          id,
          booking_date,
          time_slot,
          total_price,
          booking_rooms!inner (
            id,
            room_type:room_types!inner(name),
            service_type,
            booking_addons!inner (
              service_options!inner(name)
            )
          )
        `)
        .eq("user_id", user.id)
        .eq("status", "pending")
        .gte("booking_date", new Date().toISOString().split('T')[0])
        .order("booking_date", { ascending: true });

      if (error) {
        console.error("Error fetching upcoming services:", error);
        return [];
      }

      return bookings.map(booking => ({
        ...booking,
        rooms: booking.booking_rooms.map((room: any) => ({
          id: room.id,
          type: room.room_type.name,
          serviceType: room.service_type,
          addons: room.booking_addons.map((addon: any) => addon.service_options.name)
        }))
      }));
    },
    refetchInterval: 5000,
  });

  return (
    <div className="bg-white dark:bg-purple-dark/40 rounded-lg p-6">
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">Upcoming Services</TabsTrigger>
          <TabsTrigger value="history">Service History</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Services</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingServices && upcomingServices.length > 0 ? (
                upcomingServices.map((booking) => (
                  <UpcomingServiceCard key={booking.id} booking={booking} />
                ))
              ) : (
                <p className="text-muted-foreground">No upcoming services scheduled.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No service history available.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No billing information available.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};