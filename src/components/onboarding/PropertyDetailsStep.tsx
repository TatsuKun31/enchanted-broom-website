import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Samantha from "../Samantha";
import { toast } from "sonner";

interface PropertyDetailsStepProps {
  onNext: (data: { propertyType: string; address: string }) => void;
  onBack: () => void;
}

export const PropertyDetailsStep = ({ onNext, onBack }: PropertyDetailsStepProps) => {
  const [propertyType, setPropertyType] = useState("house");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("No authenticated user found");
        return;
      }

      const { error } = await supabase
        .from('properties')
        .insert({
          user_id: user.id,
          property_type: propertyType,
          address
        });

      if (error) throw error;

      onNext({ propertyType, address });
    } catch (error) {
      toast.error("Failed to save property details");
      console.error("Error saving property details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-up">
      <Samantha 
        message="Great! Now, let me know about your property so we can provide the best cleaning service possible." 
        position="right"
      />
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <Label>Property type</Label>
          <RadioGroup
            defaultValue="house"
            onValueChange={(value) => setPropertyType(value)}
            className="grid grid-cols-2 gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="house" id="house" />
              <Label htmlFor="house">House</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="apartment" id="apartment" />
              <Label htmlFor="apartment">Apartment</Label>
            </div>
          </RadioGroup>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Property address</Label>
          <Input
            id="address"
            placeholder="123 Main St, City, State"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>
        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading ? "Saving..." : "Continue"}
          </Button>
        </div>
      </form>
    </div>
  );
};