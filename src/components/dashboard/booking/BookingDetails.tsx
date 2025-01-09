import { CalendarDays, Clock, Home } from "lucide-react";
import { format } from "date-fns";
import { CardContent } from "@/components/ui/card";
import { Room } from "./types";

interface BookingDetailsProps {
  date: string;
  timeSlot: string;
  rooms: Room[];
  timeSlotMap: Record<string, string>;
}

export const BookingDetails = ({ date, timeSlot, rooms, timeSlotMap }: BookingDetailsProps) => {
  return (
    <CardContent className="pt-4">
      <div className="space-y-4">
        <div className="rounded-lg p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2 text-purple-primary">
            <Home className="h-5 w-5" />
            Rooms and Services
          </h4>
          <div className="space-y-3">
            {rooms.map((room) => (
              <div key={room.id} className="ml-4">
                <p className="text-purple-dark/90 dark:text-purple-secondary/90 font-medium">
                  {room.type} {room.quantity && room.quantity > 1 ? `(${room.quantity}x)` : ''} -{" "}
                  <span className="text-purple-primary">
                    {room.serviceType === "deep" ? "Deep Clean" : "Standard Clean"}
                  </span>
                </p>
                {room.addons.length > 0 && (
                  <div className="ml-4 mt-2">
                    <p className="text-sm text-purple-dark/70 dark:text-purple-secondary/70">Add-ons:</p>
                    <ul className="list-disc list-inside text-sm text-purple-dark/60 dark:text-purple-secondary/60">
                      {room.addons.map((addon) => (
                        <li key={addon}>{addon}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </CardContent>
  );
};