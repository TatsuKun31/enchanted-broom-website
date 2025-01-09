import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RoomSelection } from "./booking/RoomSelection";
import { ServiceSelection } from "./booking/ServiceSelection";
import { BookingSummary } from "./booking/BookingSummary";
import { Room } from "./booking/types";

const COUNTABLE_ROOMS = [
  "Bathroom",
  "Half Bath",
  "Bedroom",
  "Media Room",
  "Home Office"
];

interface ServiceBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ServiceBookingModal = ({ open, onOpenChange }: ServiceBookingModalProps) => {
  const [step, setStep] = useState(1);
  const [selectedRooms, setSelectedRooms] = useState<Room[]>([]);
  const { toast } = useToast();

  const { data: roomTypes } = useQuery({
    queryKey: ["roomTypes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("room_types")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

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

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: booking, error: bookingError } = await supabase
        .from("service_bookings")
        .insert({
          user_id: user.id,
          total_price: calculateTotal(),
          status: "pending"
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      for (const room of selectedRooms) {
        const { error: roomError } = await supabase
          .from("booking_rooms")
          .insert({
            booking_id: booking.id,
            room_type_id: roomTypes?.find(rt => rt.name === room.type)?.id,
            service_type: room.serviceType
          });

        if (roomError) throw roomError;
      }

      toast({
        title: "Success!",
        description: "Your service has been booked successfully.",
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? "Select Rooms" : step === 2 ? "Choose Services" : "Review & Confirm"}
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
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
        )}

        {step === 2 && (
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
        )}

        {step === 3 && (
          <BookingSummary
            selectedRooms={selectedRooms}
            onBack={() => setStep(2)}
            onSubmit={handleSubmit}
            calculateTotal={calculateTotal}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};