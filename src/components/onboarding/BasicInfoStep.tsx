import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Samantha from "../Samantha";
import { toast } from "sonner";

interface BasicInfoStepProps {
  onNext: (data: { name: string; phone: string }) => void;
}

export const BasicInfoStep = ({ onNext }: BasicInfoStepProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
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
        .from('profiles')
        .update({ name, phone })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      onNext({ name, phone });
    } catch (error) {
      toast.error("Failed to save basic information");
      console.error("Error saving basic info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-up">
      <Samantha 
        message="Hi there! I'm Samantha, and I'll be your guide through setting up your cleaning service. Let's start with your basic information!" 
        position="left"
      />
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">What's your name?</Label>
          <Input
            id="name"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(555) 555-5555"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Saving..." : "Continue"}
        </Button>
      </form>
    </div>
  );
};