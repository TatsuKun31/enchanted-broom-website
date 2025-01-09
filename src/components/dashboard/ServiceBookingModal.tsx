import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Room {
  id: string;
  type: string;
  serviceType: "standard" | "deep";
  addons: string[];
}

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

  const { data: serviceOptions } = useQuery({
    queryKey: ["serviceOptions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_options")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const handleRoomSelection = (roomType: string) => {
    if (selectedRooms.find(room => room.type === roomType)) {
      setSelectedRooms(selectedRooms.filter(room => room.type !== roomType));
    } else {
      setSelectedRooms([...selectedRooms, { id: crypto.randomUUID(), type: roomType, serviceType: "standard", addons: [] }]);
    }
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
      total += room.serviceType === "deep" ? 100 : 50;
      total += room.addons.length * 10;
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
            <div className="grid grid-cols-2 gap-4">
              {roomTypes?.map((roomType) => (
                <Button
                  key={roomType.id}
                  variant={selectedRooms.some(room => room.type === roomType.name) ? "default" : "outline"}
                  onClick={() => handleRoomSelection(roomType.name)}
                  className="w-full"
                >
                  {roomType.name}
                </Button>
              ))}
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} disabled={selectedRooms.length === 0}>
                Next
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            {selectedRooms.map((room) => (
              <div key={room.id} className="space-y-4 border p-4 rounded-lg">
                <h3 className="font-semibold">{room.type}</h3>
                <div className="space-y-2">
                  <div className="flex gap-4">
                    <Button
                      variant={room.serviceType === "standard" ? "default" : "outline"}
                      onClick={() => handleServiceTypeChange(room.id, "standard")}
                      size="sm"
                    >
                      Standard Clean
                    </Button>
                    <Button
                      variant={room.serviceType === "deep" ? "default" : "outline"}
                      onClick={() => handleServiceTypeChange(room.id, "deep")}
                      size="sm"
                    >
                      Deep Clean
                    </Button>
                  </div>
                  {room.type === "Bedroom" && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`make-beds-${room.id}`}
                        checked={room.addons.includes("Make Beds")}
                        onCheckedChange={() => handleAddonToggle(room.id, "Make Beds")}
                      />
                      <label htmlFor={`make-beds-${room.id}`}>Make Beds (Included)</label>
                    </div>
                  )}
                  {room.type === "Kitchen" && (
                    <div className="space-y-2">
                      {["Do Dishes", "Oven Cleaning", "Fridge Cleanout"].map((addon) => (
                        <div key={addon} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${addon}-${room.id}`}
                            checked={room.addons.includes(addon)}
                            onCheckedChange={() => handleAddonToggle(room.id, addon)}
                          />
                          <label htmlFor={`${addon}-${room.id}`}>
                            {addon} (+$10)
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
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
          <div className="space-y-6">
            <div className="space-y-4">
              {selectedRooms.map((room) => (
                <div key={room.id} className="border p-4 rounded-lg">
                  <h3 className="font-semibold">{room.type}</h3>
                  <p>Service: {room.serviceType === "deep" ? "Deep Clean ($100)" : "Standard Clean ($50)"}</p>
                  {room.addons.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium">Add-ons:</p>
                      <ul className="list-disc list-inside">
                        {room.addons.map((addon) => (
                          <li key={addon}>
                            {addon} {addon !== "Make Beds" && "(+$10)"}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
              <div className="border-t pt-4">
                <p className="text-lg font-semibold">
                  Total: ${calculateTotal()}
                </p>
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={handleSubmit}>
                Book Service
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};