import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Room } from "./types";
import { BookingConfirmationModal } from "./BookingConfirmationModal";
import { useToast } from "@/hooks/use-toast";

interface BookingSummaryProps {
  selectedRooms: Room[];
  onBack: () => void;
  onSubmit: () => void;
  calculateTotal: () => number;
}

export const BookingSummary = ({
  selectedRooms,
  onBack,
  onSubmit,
  calculateTotal,
}: BookingSummaryProps) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const { toast } = useToast();

  const handleDateConfirmed = (date: Date, timeSlot: string) => {
    const timeSlotMap = {
      morning: "9:00 AM - 11:00 AM",
      midday: "12:00 PM - 2:00 PM",
      afternoon: "3:00 PM - 5:00 PM",
    };
    
    toast({
      title: "Booking Confirmed",
      description: `Your cleaning service has been scheduled for ${date.toLocaleDateString()} at ${timeSlotMap[timeSlot as keyof typeof timeSlotMap]}`,
    });
    setShowCalendar(false);
    onSubmit();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {selectedRooms.map((room) => (
          <div key={room.id} className="border p-4 rounded-lg">
            <h3 className="font-semibold">
              {room.type} {room.quantity && room.quantity > 1 ? `(${room.quantity}x)` : ''}
            </h3>
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
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={() => setShowCalendar(true)}>
          Book Service
        </Button>
      </div>

      <BookingConfirmationModal
        open={showCalendar}
        onOpenChange={setShowCalendar}
        onConfirm={handleDateConfirmed}
      />
    </div>
  );
};