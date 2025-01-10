import { BasicInfoStep } from "./BasicInfoStep";
import { ServicePreferencesStep } from "./ServicePreferencesStep";
import { OnboardingStep, UserData } from "@/hooks/useRoomDetailsData";

interface OnboardingFlowProps {
  currentStep: OnboardingStep;
  userData: UserData;
  setCurrentStep: (step: OnboardingStep) => void;
  setUserData: (data: UserData | ((prev: UserData) => UserData)) => void;
}

export const OnboardingFlow = ({ 
  currentStep, 
  userData, 
  setCurrentStep, 
  setUserData 
}: OnboardingFlowProps) => {
  const handleBasicInfoNext = (data: { 
    name: string; 
    phone: string;
    propertyType: string;
    address: string;
  }) => {
    setUserData((prev) => ({ ...prev, ...data }));
    setCurrentStep("service-preferences");
  };

  const handleServicePreferencesNext = (data: { frequency: string }) => {
    setUserData((prev) => ({ ...prev, ...data }));
    setCurrentStep("completed");
  };

  const renderStep = () => {
    switch (currentStep) {
      case "basic-info":
        return <BasicInfoStep onNext={handleBasicInfoNext} />;
      case "service-preferences":
        return (
          <ServicePreferencesStep
            onNext={handleServicePreferencesNext}
            onBack={() => setCurrentStep("basic-info")}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-md mx-auto pt-24 px-4">
      <div className="bg-white dark:bg-purple-dark/40 rounded-lg shadow-lg p-8 space-y-6 border border-purple-secondary/20">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-purple-primary">
            {currentStep === "basic-info"
              ? "Welcome! Let's get started"
              : "Almost done!"}
          </h1>
          <p className="text-muted-foreground">
            Step {currentStep === "basic-info" ? "1" : "2"} of 2
          </p>
        </div>
        {renderStep()}
      </div>
    </div>
  );
};