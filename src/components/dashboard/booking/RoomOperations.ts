import { Room } from "./types";

export const handleRoomSelection = (
  roomType: string,
  selectedRooms: Room[],
  setSelectedRooms: (rooms: Room[]) => void,
  COUNTABLE_ROOMS: string[]
) => {
  if (COUNTABLE_ROOMS.includes(roomType)) {
    if (!selectedRooms.find(room => room.type === roomType)) {
      setSelectedRooms([...selectedRooms, { 
        id: crypto.randomUUID(), 
        type: roomType, 
        quantity: 1,
        serviceType: "standard", 
        addons: [] 
      }]);
    }
  } else {
    if (selectedRooms.find(room => room.type === roomType)) {
      setSelectedRooms(selectedRooms.filter(room => room.type !== roomType));
    } else {
      setSelectedRooms([...selectedRooms, { 
        id: crypto.randomUUID(), 
        type: roomType, 
        serviceType: "standard", 
        addons: [] 
      }]);
    }
  }
};

export const handleQuantityChange = (
  roomId: string,
  change: number,
  selectedRooms: Room[],
  setSelectedRooms: (rooms: Room[]) => void
) => {
  setSelectedRooms(selectedRooms.map(room => {
    if (room.id === roomId) {
      const newQuantity = (room.quantity || 1) + change;
      if (newQuantity < 1) return room;
      return { ...room, quantity: newQuantity };
    }
    return room;
  }));
};

export const handleServiceTypeChange = (
  roomId: string,
  serviceType: "standard" | "deep",
  selectedRooms: Room[],
  setSelectedRooms: (rooms: Room[]) => void
) => {
  setSelectedRooms(selectedRooms.map(room => 
    room.id === roomId ? { ...room, serviceType } : room
  ));
};

export const handleAddonToggle = (
  roomId: string,
  addon: string,
  selectedRooms: Room[],
  setSelectedRooms: (rooms: Room[]) => void
) => {
  setSelectedRooms(selectedRooms.map(room => {
    if (room.id === roomId) {
      const addons = room.addons.includes(addon)
        ? room.addons.filter(a => a !== addon)
        : [...room.addons, addon];
      return { ...room, addons };
    }
    return room;
  }));
};

export const calculateTotal = (selectedRooms: Room[]) => {
  let total = 0;
  selectedRooms.forEach(room => {
    const quantity = room.quantity || 1;
    total += (room.serviceType === "deep" ? 100 : 50) * quantity;
    total += room.addons.length * 10 * quantity;
  });
  return total;
};