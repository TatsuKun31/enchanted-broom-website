import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface PriceAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PriceAdjustmentModal = ({ isOpen, onClose }: PriceAdjustmentModalProps) => {
  const queryClient = useQueryClient();
  const [priceUpdates, setPriceUpdates] = useState<Record<string, number>>({});

  const { data: services, isLoading } = useQuery({
    queryKey: ['serviceOptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_options')
        .select('id, name, price, room_type_id, room_types(name)');
      
      if (error) throw error;
      return data;
    }
  });

  const updatePriceMutation = useMutation({
    mutationFn: async ({ serviceId, newPrice, oldPrice }: { serviceId: string, newPrice: number, oldPrice: number }) => {
      // First update the service option price
      const { error: updateError } = await supabase
        .from('service_options')
        .update({ price: newPrice })
        .eq('id', serviceId);

      if (updateError) throw updateError;

      // Then record the price adjustment
      const { error: logError } = await supabase
        .from('price_adjustments')
        .insert({
          service_option_id: serviceId,
          previous_price: oldPrice,
          new_price: newPrice,
        });

      if (logError) throw logError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceOptions'] });
      toast.success("Price updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update price: " + error.message);
    }
  });

  const handlePriceChange = (serviceId: string, price: string) => {
    const numericPrice = parseFloat(price);
    if (!isNaN(numericPrice) && numericPrice >= 0) {
      setPriceUpdates(prev => ({
        ...prev,
        [serviceId]: numericPrice
      }));
    }
  };

  const handleSave = async (serviceId: string, oldPrice: number) => {
    const newPrice = priceUpdates[serviceId];
    if (newPrice === undefined || newPrice === oldPrice) return;

    await updatePriceMutation.mutateAsync({
      serviceId,
      newPrice,
      oldPrice
    });

    // Clear the update for this service
    setPriceUpdates(prev => {
      const { [serviceId]: _, ...rest } = prev;
      return rest;
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Adjust Service Prices</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            services?.map((service) => (
              <div key={service.id} className="flex flex-col space-y-2">
                <label className="text-sm font-medium">
                  {service.room_types?.name} - {service.name}
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={service.price}
                    onChange={(e) => handlePriceChange(service.id, e.target.value)}
                    className="w-32"
                  />
                  <Button 
                    variant="outline"
                    onClick={() => handleSave(service.id, service.price)}
                    disabled={!priceUpdates[service.id] || priceUpdates[service.id] === service.price}
                  >
                    Save
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};