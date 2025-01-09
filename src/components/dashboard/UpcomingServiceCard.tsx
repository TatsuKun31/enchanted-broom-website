import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ServiceBookingModal } from "./ServiceBookingModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

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
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const timeSlotMap = {
    morning: "9:00 AM - 11:00 AM",
    midday: "12:00 PM - 2:00 PM",
    afternoon: "3:00 PM - 5:00 PM",
  };

  const handleCancelBooking = async () => {
    try {
      const { error } = await supabase
        .from("service_bookings")
        .delete()
        .eq("id", booking.id);

      if (error) throw error;

      toast({
        title: "Service Cancelled",
        description: "Your service has been successfully cancelled.",
      });

      queryClient.invalidateQueries({ queryKey: ["nextService"] });
      queryClient.invalidateQueries({ queryKey: ["upcomingServices"] });
    } catch (error) {
      console.error("Error cancelling service:", error);
      toast({
        title: "Error",
        description: "Failed to cancel service. Please try again.",
        variant: "destructive",
      });
    }
    setShowCancelDialog(false);
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {format(new Date(booking.booking_date), "MMMM do, yyyy")} at{" "}
          {timeSlotMap[booking.time_slot as keyof typeof timeSlotMap]}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Rooms:</h4>
            {booking.rooms.map((room) => (
              <div key={room.id} className="ml-4 mb-2">
                <p>
                  {room.type} {room.quantity && room.quantity > 1 ? `(${room.quantity}x)` : ''} -{" "}
                  {room.serviceType === "deep" ? "Deep Clean" : "Standard Clean"}
                </p>
                {room.addons.length > 0 && (
                  <div className="ml-4 text-sm text-muted-foreground">
                    <p>Add-ons:</p>
                    <ul className="list-disc list-inside">
                      {room.addons.map((addon) => (
                        <li key={addon}>{addon}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div>
            <p className="font-medium">Total Price: ${booking.total_price}</p>
          </div>
          <div className="flex gap-4">
            <Button
              variant="default"
              className="bg-purple-primary hover:bg-purple-600"
              onClick={() => setShowEditModal(true)}
            >
              Make Changes
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowCancelDialog(true)}
            >
              Cancel Service
            </Button>
          </div>
        </div>
      </CardContent>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Service</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this service? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep it</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleCancelBooking}
            >
              Yes, cancel service
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ServiceBookingModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        existingBooking={booking}
      />
    </Card>
  );
};