import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CancellationDialog } from "./CancellationDialog";
import { ServiceBookingModal } from "../ServiceBookingModal";
import { BookingHeader } from "./BookingHeader";
import { BookingDetails } from "../booking/BookingDetails";
import { BookingActions } from "./BookingActions";
import { Room } from "../booking/types";

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
  const [isCancelling, setIsCancelling] = useState(false);
  const queryClient = useQueryClient();

  const timeSlotMap = {
    morning: "9:00 AM - 11:00 AM",
    midday: "12:00 PM - 2:00 PM",
    afternoon: "3:00 PM - 5:00 PM",
  };

  const handleCancelBooking = async () => {
    try {
      setIsCancelling(true);
      const { error } = await supabase
        .from('service_bookings')
        .delete()
        .eq('id', booking.id);

      if (error) throw error;

      setShowCancelDialog(false);
      toast.success("Service cancelled successfully");

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["upcomingServices"] }),
        queryClient.invalidateQueries({ queryKey: ["nextService"] })
      ]);
    } catch (error) {
      console.error('Error cancelling service:', error);
      toast.error("Failed to cancel service. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  const transformedRooms: Room[] = booking.rooms.map(room => ({
    id: room.id,
    type: room.type,
    serviceType: room.serviceType === "deep" ? "deep" : "standard",
    addons: room.addons,
    quantity: room.quantity
  }));

  return (
    <div>
      <BookingHeader 
        date={booking.booking_date}
        timeSlot={booking.time_slot}
        timeSlotMap={timeSlotMap}
      />

      <BookingDetails
        date={booking.booking_date}
        timeSlot={booking.time_slot}
        rooms={transformedRooms}
        timeSlotMap={timeSlotMap}
      />

      <BookingActions
        totalPrice={booking.total_price}
        onEdit={() => setShowEditModal(true)}
        onCancel={() => setShowCancelDialog(true)}
        isCancelling={isCancelling}
      />

      <CancellationDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={handleCancelBooking}
        isCancelling={isCancelling}
      />

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
    </div>
  );
};