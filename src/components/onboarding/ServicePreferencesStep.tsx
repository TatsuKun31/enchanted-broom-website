import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ServicePreferencesStepProps {
  onNext: (data: { frequency: string }) => void;
  onBack: () => void;
}

export const ServicePreferencesStep = ({ onNext, onBack }: ServicePreferencesStepProps) => {
  const [frequency, setFrequency] = useState("");
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
        .from('service_preferences')
        .insert({
          user_id: user.id,
          frequency
        })
        .select()
        .single();

      if (error) throw error;

      onNext({ frequency });
    } catch (error) {
      toast.error("Failed to save service preferences");
      console.error("Error saving service preferences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-up">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label>How often would you like cleaning service?</Label>
          <Select required onValueChange={setFrequency}>
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="biweekly">Bi-weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading ? "Saving..." : "Complete Setup"}
          </Button>
        </div>
      </form>
    </div>
  );
};