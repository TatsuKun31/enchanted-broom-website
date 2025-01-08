import { useState } from "react";
import Navigation from "@/components/Navigation";
import { BasicInfoStep } from "@/components/onboarding/BasicInfoStep";
import { PropertyDetailsStep } from "@/components/onboarding/PropertyDetailsStep";
import { ServicePreferencesStep } from "@/components/onboarding/ServicePreferencesStep";
import { DashboardView } from "@/components/dashboard/DashboardView";

type OnboardingStep = "basic-info" | "property-details" | "service-preferences" | "completed";

const RoomDetails = () => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("basic-info");
  const [userData, setUserData] = useState({
    name: "",
    phone: "",
    propertyType: "",
    address: "",
    frequency: "",
    timePreference: "",
  });

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