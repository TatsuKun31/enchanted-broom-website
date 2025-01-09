import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { addDays } from "date-fns";

interface BookingConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (date: Date, timeSlot: string) => void;
}

const TIME_SLOTS = {
  morning: "9:00 AM - 11:00 AM",
  midday: "12:00 PM - 2:00 PM",
  afternoon: "3:00 PM - 5:00 PM",
};

export const BookingConfirmationModal = ({
  open,
  onOpenChange,
  onConfirm,
}: BookingConfirmationModalProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>();
  
  // Calculate date range for the next 2 weeks
  const today = new Date();
  const twoWeeksFromNow = addDays(today, 14);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Appointment Date & Time</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            fromDate={today}
            toDate={twoWeeksFromNow}
            disabled={(date) => date < today}
          />
          
          {selectedDate && (
            <div className="space-y-4">
              <Label>Select Time Slot</Label>
              <RadioGroup
                value={selectedTimeSlot}
                onValueChange={setSelectedTimeSlot}
                className="gap-4"
              >
                {Object.entries(TIME_SLOTS).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <RadioGroupItem value={key} id={key} />
                    <Label htmlFor={key}>{value}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => selectedDate && selectedTimeSlot && onConfirm(selectedDate, selectedTimeSlot)}
            disabled={!selectedDate || !selectedTimeSlot}
          >
            Confirm Booking
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};