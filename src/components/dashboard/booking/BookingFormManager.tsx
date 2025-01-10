import { Room } from "./types";
import { RoomSelection } from "./RoomSelection";
import { ServiceSelection } from "./ServiceSelection";
import { MobileRoomSelection } from "./MobileRoomSelection";
import { MobileServiceSelection } from "./MobileServiceSelection";
import { BookingSummary } from "./BookingSummary";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  handleRoomSelection,
  handleQuantityChange,
  handleServiceTypeChange,
  handleAddonToggle,
  calculateTotal
} from "./RoomOperations";
import { handleBookingSubmit } from "./BookingSubmission";

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
  const isMobile = useIsMobile();

  if (step === 1) {
    return (
      <div className="space-y-4">
        {isMobile ? (
          <MobileRoomSelection
            roomTypes={roomTypes || []}
            selectedRooms={selectedRooms}
            onRoomSelection={(roomType) => handleRoomSelection(roomType, selectedRooms, setSelectedRooms, COUNTABLE_ROOMS)}
            onQuantityChange={(roomId, change) => handleQuantityChange(roomId, change, selectedRooms, setSelectedRooms)}
            COUNTABLE_ROOMS={COUNTABLE_ROOMS}
          />
        ) : (
          <RoomSelection
            roomTypes={roomTypes || []}
            selectedRooms={selectedRooms}
            onRoomSelection={(roomType) => handleRoomSelection(roomType, selectedRooms, setSelectedRooms, COUNTABLE_ROOMS)}
            onQuantityChange={(roomId, change) => handleQuantityChange(roomId, change, selectedRooms, setSelectedRooms)}
            COUNTABLE_ROOMS={COUNTABLE_ROOMS}
          />
        )}
        <div className="flex justify-end">
          <Button 
            onClick={() => setStep(2)} 
            disabled={selectedRooms.length === 0}
            className="w-full md:w-auto"
          >
            Next
          </Button>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="space-y-6">
        {isMobile ? (
          <MobileServiceSelection
            selectedRooms={selectedRooms}
            onServiceTypeChange={(roomId, serviceType) => 
              handleServiceTypeChange(roomId, serviceType, selectedRooms, setSelectedRooms)}
            onAddonToggle={(roomId, addon) => 
              handleAddonToggle(roomId, addon, selectedRooms, setSelectedRooms)}
          />
        ) : (
          <ServiceSelection
            selectedRooms={selectedRooms}
            onServiceTypeChange={(roomId, serviceType) => 
              handleServiceTypeChange(roomId, serviceType, selectedRooms, setSelectedRooms)}
            onAddonToggle={(roomId, addon) => 
              handleAddonToggle(roomId, addon, selectedRooms, setSelectedRooms)}
          />
        )}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setStep(1)}
            className="w-full md:w-auto"
          >
            Back
          </Button>
          <Button 
            onClick={() => setStep(3)}
            className="w-full md:w-auto ml-4"
          >
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
      onSubmit={(date, timeSlot) => handleBookingSubmit(
        date,
        timeSlot,
        selectedRooms,
        existingBookingId,
        roomTypes,
        toast,
        onOpenChange
      )}
      calculateTotal={() => calculateTotal(selectedRooms)}
    />
  );
};