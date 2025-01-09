import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceBookingModal } from "./ServiceBookingModal";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Clock } from "lucide-react";
import { BookingDetails } from "./booking/BookingDetails";
import { Room } from "./booking/types";

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
  const [showEditModal, setShowEditModal] = useState(false);
  const queryClient = useQueryClient();

  const timeSlotMap = {
    morning: "9:00 AM - 11:00 AM",
    midday: "12:00 PM - 2:00 PM",
    afternoon: "3:00 PM - 5:00 PM",
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
        <Button
          variant="outline"
          className="border-purple-primary text-purple-primary hover:bg-purple-secondary/20"
          onClick={() => setShowEditModal(true)}
        >
          Make Changes
        </Button>
      </div>

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