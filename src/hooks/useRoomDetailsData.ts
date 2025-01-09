import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type OnboardingStep = "basic-info" | "property-details" | "service-preferences" | "completed";

export interface UserData {
  name: string;
  phone: string;
  propertyType: string;
  address: string;
  frequency: string;
  timePreference: string;
}

export const useRoomDetailsData = () => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("basic-info");
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData>({
    name: "",
    phone: "",
    propertyType: "",
    address: "",
    frequency: "",
    timePreference: "",
  });

  const { data: sessionData } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (!session) {
        navigate('/auth');
        return null;
      }
      return session;
    },
  });

  const { data: profileData, isLoading: isProfileLoading, error: profileError } = useQuery({
    queryKey: ['profile', sessionData?.user?.id],
    queryFn: async () => {
      if (!sessionData?.user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionData.user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!sessionData?.user?.id,
  });

  const { data: propertyData, isLoading: isPropertyLoading } = useQuery({
    queryKey: ['property', sessionData?.user?.id],
    queryFn: async () => {
      if (!sessionData?.user?.id) return null;
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', sessionData.user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!sessionData?.user?.id,
  });

  const { data: preferencesData, isLoading: isPreferencesLoading } = useQuery({
    queryKey: ['preferences', sessionData?.user?.id],
    queryFn: async () => {
      if (!sessionData?.user?.id) return null;
      const { data, error } = await supabase
        .from('service_preferences')
        .select('*')
        .eq('user_id', sessionData.user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!sessionData?.user?.id,
  });

  useEffect(() => {
    if (!isProfileLoading && !isPropertyLoading && !isPreferencesLoading) {
      if (profileData?.name && propertyData?.property_type && preferencesData?.frequency) {
        setUserData({
          name: profileData.name || "",
          phone: profileData.phone || "",
          propertyType: propertyData.property_type || "",
          address: propertyData.address || "",
          frequency: preferencesData.frequency || "",
          timePreference: preferencesData.time_preference || "",
        });
        setCurrentStep("completed");
      } else {
        if (!profileData?.name) {
          setCurrentStep("basic-info");
        } else if (!propertyData?.property_type) {
          setCurrentStep("property-details");
        } else {
          setCurrentStep("service-preferences");
        }
      }
    }
  }, [profileData, propertyData, preferencesData, isProfileLoading, isPropertyLoading, isPreferencesLoading]);

  return {
    currentStep,
    setCurrentStep,
    userData,
    setUserData,
    isLoading: isProfileLoading || isPropertyLoading || isPreferencesLoading,
    profileError
  };
};