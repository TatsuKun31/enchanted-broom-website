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
import { BookingFormManager } from "./booking/BookingFormManager";

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? "Select Rooms" : step === 2 ? "Choose Services" : "Review & Confirm"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <BookingFormManager
            step={step}
            setStep={setStep}
            selectedRooms={selectedRooms}
            setSelectedRooms={setSelectedRooms}
            roomTypes={roomTypes}
            COUNTABLE_ROOMS={COUNTABLE_ROOMS}
            toast={toast}
            onOpenChange={onOpenChange}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};