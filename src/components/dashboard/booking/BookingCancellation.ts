import { supabase } from "@/integrations/supabase/client";
import { QueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

export const cancelBooking = async (
  bookingId: string,
  queryClient: QueryClient
) => {
  try {
    // First, get all booking rooms for this booking
    const { data: bookingRooms } = await supabase
      .from("booking_rooms")
      .select("id")
      .eq("booking_id", bookingId);

    if (!bookingRooms) {
      throw new Error("Could not fetch booking rooms");
    }

    // Delete all addons for each booking room one at a time
    for (const room of bookingRooms) {
      const { error: addonsError } = await supabase
        .from("booking_addons")
        .delete()
        .eq("booking_room_id", room.id);

      if (addonsError) {
        console.error("Error deleting booking addons:", addonsError);
        throw addonsError;
      }
    }

    // After all addons are deleted, delete all booking rooms
    const { error: roomsError } = await supabase
      .from("booking_rooms")
      .delete()
      .eq("booking_id", bookingId);

    if (roomsError) {
      console.error("Error deleting booking rooms:", roomsError);
      throw roomsError;
    }

    // Finally, delete the service booking
    const { error: bookingError } = await supabase
      .from("service_bookings")
      .delete()
      .eq("id", bookingId);

    if (bookingError) {
      console.error("Error deleting service booking:", bookingError);
      throw bookingError;
    }

    toast({
      title: "Service Cancelled",
      description: "Your service has been successfully cancelled.",
    });

    // Invalidate queries to refresh the data
    queryClient.invalidateQueries({ queryKey: ["nextService"] });
    queryClient.invalidateQueries({ queryKey: ["upcomingServices"] });
  } catch (error) {
    console.error("Error cancelling service:", error);
    toast({
      title: "Error",
      description: "Failed to cancel service. Please try again.",
      variant: "destructive",
    });
    throw error;
  }
};