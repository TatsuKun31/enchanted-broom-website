import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Room } from "./types";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Settings2 } from "lucide-react";

interface MobileServiceSelectionProps {
  selectedRooms: Room[];
  onServiceTypeChange: (roomId: string, serviceType: "standard" | "deep") => void;
  onAddonToggle: (roomId: string, addon: string) => void;
}

export const MobileServiceSelection = ({
  selectedRooms,
  onServiceTypeChange,
  onAddonToggle,
}: MobileServiceSelectionProps) => {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <div className="space-y-4">
      {selectedRooms.map((room) => (
        <Sheet key={room.id}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span>{room.type} {room.quantity && room.quantity > 1 ? `(${room.quantity}x)` : ''}</span>
              <Settings2 className="h-4 w-4 ml-2" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>Configure {room.type}</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={room.serviceType === "standard" ? "default" : "outline"}
                  onClick={() => onServiceTypeChange(room.id, "standard")}
                  className="py-6"
                >
                  Standard Clean
                </Button>
                <Button
                  variant={room.serviceType === "deep" ? "default" : "outline"}
                  onClick={() => onServiceTypeChange(room.id, "deep")}
                  className="py-6"
                >
                  Deep Clean
                </Button>
              </div>
              
              {room.type === "Bedroom" && (
                <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
                  <Checkbox
                    id={`make-beds-${room.id}`}
                    checked={room.addons.includes("Make Beds")}
                    onCheckedChange={() => onAddonToggle(room.id, "Make Beds")}
                  />
                  <label 
                    htmlFor={`make-beds-${room.id}`}
                    className="text-lg"
                  >
                    Make Beds (Included)
                  </label>
                </div>
              )}
              
              {room.type === "Kitchen" && (
                <div className="space-y-4">
                  {["Do Dishes", "Oven Cleaning", "Fridge Cleanout"].map((addon) => (
                    <div key={addon} className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
                      <Checkbox
                        id={`${addon}-${room.id}`}
                        checked={room.addons.includes(addon)}
                        onCheckedChange={() => onAddonToggle(room.id, addon)}
                      />
                      <label 
                        htmlFor={`${addon}-${room.id}`}
                        className="text-lg"
                      >
                        {addon} (+$10)
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  );
};