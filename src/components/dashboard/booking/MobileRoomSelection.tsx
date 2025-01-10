import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { Room } from "./types";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileRoomSelectionProps {
  roomTypes: any[];
  selectedRooms: Room[];
  onRoomSelection: (roomType: string) => void;
  onQuantityChange: (roomId: string, change: number) => void;
  COUNTABLE_ROOMS: string[];
}

export const MobileRoomSelection = ({
  roomTypes,
  selectedRooms,
  onRoomSelection,
  onQuantityChange,
  COUNTABLE_ROOMS,
}: MobileRoomSelectionProps) => {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {roomTypes?.map((roomType) => (
          <div key={roomType.id} className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 rounded-lg shadow-sm">
            <Button
              variant={selectedRooms.some(room => room.type === roomType.name) ? "default" : "outline"}
              onClick={() => onRoomSelection(roomType.name)}
              className="w-full text-lg py-6"
            >
              {roomType.name}
            </Button>
            {selectedRooms.some(room => room.type === roomType.name) && 
             COUNTABLE_ROOMS.includes(roomType.name) && (
              <div className="flex items-center justify-center gap-4 mt-4">
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => onQuantityChange(
                    selectedRooms.find(r => r.type === roomType.name)!.id,
                    -1
                  )}
                  className="h-12 w-12"
                >
                  <Minus className="h-6 w-6" />
                </Button>
                <span className="min-w-[3rem] text-center text-xl">
                  {selectedRooms.find(r => r.type === roomType.name)?.quantity || 1}
                </span>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => onQuantityChange(
                    selectedRooms.find(r => r.type === roomType.name)!.id,
                    1
                  )}
                  className="h-12 w-12"
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};