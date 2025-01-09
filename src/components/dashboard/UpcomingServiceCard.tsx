import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ServiceBookingModal } from "./ServiceBookingModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Clock, Home } from "lucide-react";

interface UpcomingServiceCardProps {
  booking: {
    id: string;
    booking_date: string;
    time_slot: string;
    total_price: number;
    rooms: Array<{
      id: string;
      type: string;
      serviceType: string;
      addons: string[];
      quantity?: number;
    }>;
  };
}

export const UpcomingServiceCard = ({ booking }: UpcomingServiceCardProps) => {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const timeSlotMap = {
    morning: "9:00 AM - 11:00 AM",
    midday: "12:00 PM - 2:00 PM",
    afternoon: "3:00 PM - 5:00 PM",
  };

  const handleCancelBooking = async () => {
    try {
      const { error } = await supabase
        .from("service_bookings")
        .delete()
        .eq("id", booking.id);

      if (error) throw error;

      toast({
        title: "Service Cancelled",
        description: "Your service has been successfully cancelled.",
      });

      queryClient.invalidateQueries({ queryKey: ["nextService"] });
      queryClient.invalidateQueries({ queryKey: ["upcomingServices"] });
    } catch (error) {
      console.error("Error cancelling service:", error);
      toast({
        title: "Error",
        description: "Failed to cancel service. Please try again.",
        variant: "destructive",
      });
    }
    setShowCancelDialog(false);
  };

  return (
    <Card className="mb-4 border border-purple-secondary/20 hover:border-purple-primary/30 transition-all duration-300 bg-purple-secondary/5 dark:bg-purple-dark/10">
      <CardHeader className="rounded-t-lg pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2 text-purple-primary">
          <CalendarDays className="h-5 w-5" />
          {format(new Date(booking.booking_date), "MMMM do, yyyy")}
          <span className="mx-2">•</span>
          <Clock className="h-5 w-5" />
          {timeSlotMap[booking.time_slot as keyof typeof timeSlotMap]}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="rounded-lg p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2 text-purple-primary">
              <Home className="h-5 w-5" />
              Rooms and Services
            </h4>
            <div className="space-y-3">
              {booking.rooms.map((room) => (
                <div key={room.id} className="ml-4">
                  <p className="text-purple-dark/90 dark:text-purple-secondary/90 font-medium">
                    {room.type} {room.quantity && room.quantity > 1 ? `(${room.quantity}x)` : ''} -{" "}
                    <span className="text-purple-primary">
                      {room.serviceType === "deep" ? "Deep Clean" : "Standard Clean"}
                    </span>
                  </p>
                  {room.addons.length > 0 && (
                    <div className="ml-4 mt-2">
                      <p className="text-sm text-purple-dark/70 dark:text-purple-secondary/70">Add-ons:</p>
                      <ul className="list-disc list-inside text-sm text-purple-dark/60 dark:text-purple-secondary/60">
                        {room.addons.map((addon) => (
                          <li key={addon}>{addon}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center border-t border-purple-secondary/20 pt-4">
            <p className="font-medium text-lg text-purple-primary">
              Total: ${booking.total_price}
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="border-purple-primary text-purple-primary hover:bg-purple-secondary/20"
                onClick={() => setShowEditModal(true)}
              >
                Make Changes
              </Button>
              <Button
                variant="destructive"
                className="hover:bg-destructive/90"
                onClick={() => setShowCancelDialog(true)}
              >
                Cancel Service
              </Button>
            </div>
          </div>
        </div>
      </CardContent>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Service</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this service? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep it</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleCancelBooking}
            >
              Yes, cancel service
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ServiceBookingModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        existingBooking={booking}
      />
    </Card>
  );
};