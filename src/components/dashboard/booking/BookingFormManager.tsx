import { supabase } from "@/integrations/supabase/client";
import { Room } from "./types";
import { RoomSelection } from "./RoomSelection";
import { ServiceSelection } from "./ServiceSelection";
import { BookingSummary } from "./BookingSummary";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";

interface BookingFormManagerProps {
  step: number;
  setStep: (step: number) => void;
  selectedRooms: Room[];
  setSelectedRooms: (rooms: Room[]) => void;
  roomTypes: any[];
  COUNTABLE_ROOMS: string[];
  toast: any;
  onOpenChange: (open: boolean) => void;
  existingBookingId?: string;
}

export const BookingFormManager = ({
  step,
  setStep,
  selectedRooms,
  setSelectedRooms,
  roomTypes,
  COUNTABLE_ROOMS,
  toast,
  onOpenChange,
  existingBookingId,
}: BookingFormManagerProps) => {
  const handleRoomSelection = (roomType: string) => {
    if (COUNTABLE_ROOMS.includes(roomType)) {
      if (!selectedRooms.find(room => room.type === roomType)) {
        setSelectedRooms([...selectedRooms, { 
          id: crypto.randomUUID(), 
          type: roomType, 
          quantity: 1,
          serviceType: "standard", 
          addons: [] 
        }]);
      }
    } else {
      if (selectedRooms.find(room => room.type === roomType)) {
        setSelectedRooms(selectedRooms.filter(room => room.type !== roomType));
      } else {
        setSelectedRooms([...selectedRooms, { 
          id: crypto.randomUUID(), 
          type: roomType, 
          serviceType: "standard", 
          addons: [] 
        }]);
      }
    }
  };

  const handleQuantityChange = (roomId: string, change: number) => {
    setSelectedRooms(selectedRooms.map(room => {
      if (room.id === roomId) {
        const newQuantity = (room.quantity || 1) + change;
        if (newQuantity < 1) return room;
        return { ...room, quantity: newQuantity };
      }
      return room;
    }));
  };

  const handleServiceTypeChange = (roomId: string, serviceType: "standard" | "deep") => {
    setSelectedRooms(selectedRooms.map(room => 
      room.id === roomId ? { ...room, serviceType } : room
    ));
  };

  const handleAddonToggle = (roomId: string, addon: string) => {
    setSelectedRooms(selectedRooms.map(room => {
      if (room.id === roomId) {
        const addons = room.addons.includes(addon)
          ? room.addons.filter(a => a !== addon)
          : [...room.addons, addon];
        return { ...room, addons };
      }
      return room;
    }));
  };

  const calculateTotal = () => {
    let total = 0;
    selectedRooms.forEach(room => {
      const quantity = room.quantity || 1;
      total += (room.serviceType === "deep" ? 100 : 50) * quantity;
      total += room.addons.length * 10 * quantity;
    });
    return total;
  };

  const handleSubmit = async (date: Date, timeSlot: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      let bookingId = existingBookingId;

      if (existingBookingId) {
        // Update existing booking
        const { error: bookingError } = await supabase
          .from("service_bookings")
          .update({
            total_price: calculateTotal(),
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
            total_price: calculateTotal(),
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

  if (step === 1) {
    return (
      <div className="space-y-4">
        <RoomSelection
          roomTypes={roomTypes || []}
          selectedRooms={selectedRooms}
          onRoomSelection={handleRoomSelection}
          onQuantityChange={handleQuantityChange}
          COUNTABLE_ROOMS={COUNTABLE_ROOMS}
        />
        <div className="flex justify-end">
          <Button onClick={() => setStep(2)} disabled={selectedRooms.length === 0}>
            Next
          </Button>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="space-y-6">
        <ServiceSelection
          selectedRooms={selectedRooms}
          onServiceTypeChange={handleServiceTypeChange}
          onAddonToggle={handleAddonToggle}
        />
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(1)}>
            Back
          </Button>
          <Button onClick={() => setStep(3)}>
            Review
          </Button>
        </div>
      </div>
    );
  }

  return (
    <BookingSummary
      selectedRooms={selectedRooms}
      onBack={() => setStep(2)}
      onSubmit={handleSubmit}
      calculateTotal={calculateTotal}
    />
  );
};