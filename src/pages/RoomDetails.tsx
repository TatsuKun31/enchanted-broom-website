import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { BasicInfoStep } from "@/components/onboarding/BasicInfoStep";
import { PropertyDetailsStep } from "@/components/onboarding/PropertyDetailsStep";
import { ServicePreferencesStep } from "@/components/onboarding/ServicePreferencesStep";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type OnboardingStep = "basic-info" | "property-details" | "service-preferences" | "completed";

const RoomDetails = () => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("basic-info");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: "",
    phone: "",
    propertyType: "",
    address: "",
    frequency: "",
    timePreference: "",
  });

  useEffect(() => {
    const checkUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/auth');
          return;
        }

        // Check if user has completed profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          return;
        }

        // Check if user has property details
        const { data: property, error: propertyError } = await supabase
          .from('properties')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (propertyError && propertyError.code !== 'PGRST116') {
          console.error('Property fetch error:', propertyError);
          return;
        }

        // Check if user has service preferences
        const { data: preferences, error: preferencesError } = await supabase
          .from('service_preferences')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (preferencesError && preferencesError.code !== 'PGRST116') {
          console.error('Preferences fetch error:', preferencesError);
          return;
        }

        // If user has all required data, skip onboarding
        if (profile?.name && property?.property_type && preferences?.frequency) {
          setUserData({
            name: profile.name || "",
            phone: profile.phone || "",
            propertyType: property.property_type || "",
            address: property.address || "",
            frequency: preferences.frequency || "",
            timePreference: preferences.time_preference || "",
          });
          setCurrentStep("completed");
        } else {
          // Start from the appropriate step based on what data is missing
          if (!profile?.name) {
            setCurrentStep("basic-info");
          } else if (!property?.property_type) {
            setCurrentStep("property-details");
          } else {
            setCurrentStep("service-preferences");
          }
        }
      } catch (error) {
        console.error('Error checking user data:', error);
        toast.error("Error loading user data");
      } finally {
        setIsLoading(false);
      }
    };

    checkUserData();
  }, [navigate]);

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

  if (isLoading) {
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