import { supabase } from "@/integrations/supabase/client";
import { Room } from "./types";
import { calculateTotal } from "./RoomOperations";

export const handleBookingSubmit = async (
  date: Date,
  timeSlot: string,
  selectedRooms: Room[],
  existingBookingId: string | undefined,
  roomTypes: any[],
  toast: any,
  onOpenChange: (open: boolean) => void
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user found");

    let bookingId = existingBookingId;

    if (existingBookingId) {
      // Update existing booking
      const { error: bookingError } = await supabase
        .from("service_bookings")
        .update({
          total_price: calculateTotal(selectedRooms),
          booking_date: date.toISOString().split('T')[0],
          time_slot: timeSlot
        })
        .eq('id', existingBookingId);

      if (bookingError) throw bookingError;

      // Delete existing rooms
      const { error: deleteRoomsError } = await supabase
        .from("booking_rooms")
        .delete()
        .eq('booking_id', existingBookingId);

      if (deleteRoomsError) throw deleteRoomsError;
    } else {
      // Create new booking
      const { data: booking, error: bookingError } = await supabase
        .from("service_bookings")
        .insert({
          user_id: user.id,
          total_price: calculateTotal(selectedRooms),
          status: "pending",
          booking_date: date.toISOString().split('T')[0],
          time_slot: timeSlot
        })
        .select()
        .single();

      if (bookingError) throw bookingError;
      bookingId = booking.id;
    }

    // Insert new rooms
    for (const room of selectedRooms) {
      const { error: roomError } = await supabase
        .from("booking_rooms")
        .insert({
          booking_id: bookingId,
          room_type_id: roomTypes?.find(rt => rt.name === room.type)?.id,
          service_type: room.serviceType
        });

      if (roomError) throw roomError;
    }

    toast({
      title: "Success!",
      description: existingBookingId ? "Your service has been updated successfully." : "Your service has been booked successfully.",
    });
    onOpenChange(false);
  } catch (error) {
    console.error("Error booking service:", error);
    toast({
      title: "Error",
      description: "Failed to book service. Please try again.",
      variant: "destructive",
    });
  }
};