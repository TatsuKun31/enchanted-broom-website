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

  const { data: services, isLoading, error } = useQuery({
    queryKey: ['serviceOptions'],
    queryFn: async () => {
      console.log('Fetching service options...');
      const { data, error } = await supabase
        .from('service_options')
        .select(`
          id,
          name,
          price,
          is_addon,
          room_type_id,
          room_types(name)
        `)
        .order('is_addon');
      
      if (error) {
        console.error('Error fetching service options:', error);
        throw error;
      }
      console.log('Fetched service options:', data);
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

  if (error) {
    console.error('Error in PriceAdjustmentModal:', error);
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent>
          <div className="p-4 text-red-500">
            Error loading services. Please try again later.
          </div>
        </SheetContent>
      </Sheet>
    );
  }

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
          ) : services && services.length > 0 ? (
            <>
              <div className="mb-4">
                <h3 className="font-semibold mb-3">Room Services</h3>
                {services
                  .filter(service => !service.is_addon)
                  .map((service) => (
                    <div key={service.id} className="flex flex-col space-y-2 mb-4">
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
                  ))}
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Add-on Services</h3>
                {services
                  .filter(service => service.is_addon)
                  .map((service) => (
                    <div key={service.id} className="flex flex-col space-y-2 mb-4">
                      <label className="text-sm font-medium">
                        {service.name}
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
                  ))}
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500">
              No services found. Please add services first.
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};