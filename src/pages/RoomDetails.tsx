import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { BasicInfoStep } from "@/components/onboarding/BasicInfoStep";
import { PropertyDetailsStep } from "@/components/onboarding/PropertyDetailsStep";
import { ServicePreferencesStep } from "@/components/onboarding/ServicePreferencesStep";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

type OnboardingStep = "basic-info" | "property-details" | "service-preferences" | "completed";

interface UserData {
  name: string;
  phone: string;
  propertyType: string;
  address: string;
  frequency: string;
  timePreference: string;
}

const RoomDetails = () => {
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

  // Check authentication and fetch user data
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

  // Fetch user profile data
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

  // Fetch property data
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

  // Fetch service preferences
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
    if (profileError) {
      console.error('Profile fetch error:', profileError);
      toast.error("Error loading user data");
    }
  }, [profileError]);

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

  const handleBasicInfoNext = (data: { name: string; phone: string }) => {
    setUserData((prev) => ({ ...prev, ...data }));
    setCurrentStep("property-details");
  };

  const handlePropertyDetailsNext = (data: { propertyType: string; address: string }) => {
    setUserData((prev) => ({ ...prev, ...data }));
    setCurrentStep("service-preferences");
  };

  const handleServicePreferencesNext = (data: { frequency: string; timePreference: string }) => {
    setUserData((prev) => ({ ...prev, ...data }));
    setCurrentStep("completed");
  };

  if (isProfileLoading || isPropertyLoading || isPreferencesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-purple-dark/20 dark:to-purple-dark/40">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-primary"></div>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case "basic-info":
        return <BasicInfoStep onNext={handleBasicInfoNext} />;
      case "property-details":
        return (
          <PropertyDetailsStep
            onNext={handlePropertyDetailsNext}
            onBack={() => setCurrentStep("basic-info")}
          />
        );
      case "service-preferences":
        return (
          <ServicePreferencesStep
            onNext={handleServicePreferencesNext}
            onBack={() => setCurrentStep("property-details")}
          />
        );
      case "completed":
        return <DashboardView userData={userData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-purple-dark/20 dark:to-purple-dark/40">
      <Navigation />
      {currentStep !== "completed" ? (
        <div className="max-w-md mx-auto pt-24 px-4">
          <div className="bg-white dark:bg-purple-dark/40 rounded-lg shadow-lg p-8 space-y-6 border border-purple-secondary/20">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-purple-primary">
                {currentStep === "basic-info"
                  ? "Welcome! Let's get started"
                  : currentStep === "property-details"
                  ? "Tell us about your property"
                  : "Almost done!"}
              </h1>
              <p className="text-muted-foreground">
                Step {currentStep === "basic-info" ? "1" : currentStep === "property-details" ? "2" : "3"} of 3
              </p>
            </div>
            {renderStep()}
          </div>
        </div>
      ) : (
        renderStep()
      )}
    </div>
  );
};

export default RoomDetails;