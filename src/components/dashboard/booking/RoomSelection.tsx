import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { Room } from "./types";

interface RoomSelectionProps {
  roomTypes: any[];
  selectedRooms: Room[];
  onRoomSelection: (roomType: string) => void;
  onQuantityChange: (roomId: string, change: number) => void;
  COUNTABLE_ROOMS: string[];
}

export const RoomSelection = ({
  roomTypes,
  selectedRooms,
  onRoomSelection,
  onQuantityChange,
  COUNTABLE_ROOMS,
}: RoomSelectionProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {roomTypes?.map((roomType) => (
          <div key={roomType.id} className="space-y-2">
            <Button
              variant={selectedRooms.some(room => room.type === roomType.name) ? "default" : "outline"}
              onClick={() => onRoomSelection(roomType.name)}
              className="w-full"
            >
              {roomType.name}
            </Button>
            {selectedRooms.some(room => room.type === roomType.name) && 
             COUNTABLE_ROOMS.includes(roomType.name) && (
              <div className="flex items-center justify-center gap-2 mt-1">
                <Button 
                  size="icon" 
                  variant="outline"
                  onClick={() => onQuantityChange(
                    selectedRooms.find(r => r.type === roomType.name)!.id,
                    -1
                  )}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="min-w-[2rem] text-center">
                  {selectedRooms.find(r => r.type === roomType.name)?.quantity || 1}
                </span>
                <Button 
                  size="icon" 
                  variant="outline"
                  onClick={() => onQuantityChange(
                    selectedRooms.find(r => r.type === roomType.name)!.id,
                    1
                  )}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};