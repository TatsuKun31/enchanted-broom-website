import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Room } from "./types";

interface ServiceSelectionProps {
  selectedRooms: Room[];
  onServiceTypeChange: (roomId: string, serviceType: "standard" | "deep") => void;
  onAddonToggle: (roomId: string, addon: string) => void;
}

export const ServiceSelection = ({
  selectedRooms,
  onServiceTypeChange,
  onAddonToggle,
}: ServiceSelectionProps) => {
  return (
    <div className="space-y-6">
      {selectedRooms.map((room) => (
        <div key={room.id} className="space-y-4 border p-4 rounded-lg">
          <h3 className="font-semibold">
            {room.type} {room.quantity && room.quantity > 1 ? `(${room.quantity}x)` : ''}
          </h3>
          <div className="space-y-2">
            <div className="flex gap-4">
              <Button
                variant={room.serviceType === "standard" ? "default" : "outline"}
                onClick={() => onServiceTypeChange(room.id, "standard")}
                size="sm"
              >
                Standard Clean
              </Button>
              <Button
                variant={room.serviceType === "deep" ? "default" : "outline"}
                onClick={() => onServiceTypeChange(room.id, "deep")}
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
                  onCheckedChange={() => onAddonToggle(room.id, "Make Beds")}
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
                      onCheckedChange={() => onAddonToggle(room.id, addon)}
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
    </div>
  );
};