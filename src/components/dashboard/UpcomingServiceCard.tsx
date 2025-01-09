import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Clock } from "lucide-react";
import { BookingDetails } from "./booking/BookingDetails";
import { Room } from "./booking/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const queryClient = useQueryClient();

  const timeSlotMap = {
    morning: "9:00 AM - 11:00 AM",
    midday: "12:00 PM - 2:00 PM",
    afternoon: "3:00 PM - 5:00 PM",
  };

  const handleCancelBooking = async () => {
    try {
      const { error } = await supabase
        .from('service_bookings')
        .delete()
        .eq('id', booking.id);

      if (error) throw error;

      // Close the dialog
      setShowCancelDialog(false);

      // Show success message
      toast.success("Service cancelled successfully");

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["upcomingServices"] });
      queryClient.invalidateQueries({ queryKey: ["nextService"] });

      // Refresh the page
      window.location.reload();

    } catch (error) {
      console.error('Error cancelling service:', error);
      toast.error("Failed to cancel service. Please try again.");
    }
  };

  // Transform the rooms data to match the Room type
  const transformedRooms: Room[] = booking.rooms.map(room => ({
    id: room.id,
    type: room.type,
    serviceType: room.serviceType === "deep" ? "deep" : "standard",
    addons: room.addons,
    quantity: room.quantity
  }));

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

      <BookingDetails
        date={booking.booking_date}
        timeSlot={booking.time_slot}
        rooms={transformedRooms}
        timeSlotMap={timeSlotMap}
      />

      <div className="flex justify-between items-center border-t border-purple-secondary/20 p-4">
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
        existingBooking={{
          id: booking.id,
          booking_date: booking.booking_date,
          time_slot: booking.time_slot,
          rooms: transformedRooms
        }}
      />
    </Card>
  );
};