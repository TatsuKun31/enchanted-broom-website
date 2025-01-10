import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { useRoomDetailsData } from "@/hooks/useRoomDetailsData";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useNavigate } from "react-router-dom";

const RoomDetails = () => {
  const navigate = useNavigate();
  const { 
    currentStep, 
    setCurrentStep,
    userData, 
    setUserData,
    isLoading, 
    profileError 
  } = useRoomDetailsData();

  useEffect(() => {
    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }
  }, [profileError]);

  useEffect(() => {
    if (currentStep === "completed") {
      navigate("/dashboard");
    }
  }, [currentStep, navigate]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-purple-dark/20 dark:to-purple-dark/40">
      <Navigation />
      <OnboardingFlow 
        currentStep={currentStep} 
        userData={userData}
        setCurrentStep={setCurrentStep}
        setUserData={setUserData}
      />
    </div>
  );
};

export default RoomDetails;