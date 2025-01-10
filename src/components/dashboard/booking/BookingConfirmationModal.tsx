import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { addDays } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
  // Calculate date range for the next 2 weeks
  const today = new Date();
  const twoWeeksFromNow = addDays(today, 14);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${isMobile ? 'p-4' : 'max-w-md p-6'}`}>
        <DialogHeader>
          <DialogTitle>Select Appointment Date & Time</DialogTitle>
        </DialogHeader>
        <div className={`${isMobile ? 'py-2' : 'py-4'} space-y-6`}>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            fromDate={today}
            toDate={twoWeeksFromNow}
            disabled={(date) => date < today}
            className={`${isMobile ? 'mx-auto scale-90 -mt-4' : ''}`}
          />
          
          {selectedDate && (
            <div className="space-y-4">
              <Label className="text-lg">Select Time Slot</Label>
              <RadioGroup
                value={selectedTimeSlot}
                onValueChange={setSelectedTimeSlot}
                className="gap-4"
              >
                {Object.entries(TIME_SLOTS).map(([key, value]) => (
                  <div 
                    key={key} 
                    className={`flex items-center space-x-2 ${
                      isMobile ? 'p-4 bg-muted rounded-lg' : ''
                    }`}
                  >
                    <RadioGroupItem 
                      value={key} 
                      id={key}
                      className={isMobile ? 'h-5 w-5' : ''}
                    />
                    <Label 
                      htmlFor={key}
                      className={isMobile ? 'text-lg' : ''}
                    >
                      {value}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}
        </div>
        <div className={`flex ${isMobile ? 'flex-col gap-2' : 'justify-end gap-2'}`}>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className={isMobile ? 'w-full' : ''}
          >
            Cancel
          </Button>
          <Button
            onClick={() => selectedDate && selectedTimeSlot && onConfirm(selectedDate, selectedTimeSlot)}
            disabled={!selectedDate || !selectedTimeSlot}
            className={isMobile ? 'w-full' : ''}
          >
            Confirm Booking
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};