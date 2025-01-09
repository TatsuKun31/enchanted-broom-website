import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { useRoomDetailsData } from "@/hooks/useRoomDetailsData";
import { LoadingScreen } from "@/components/LoadingScreen";

const RoomDetails = () => {
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

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-purple-dark/20 dark:to-purple-dark/40">
      <Navigation />
      {currentStep !== "completed" ? (
        <OnboardingFlow 
          currentStep={currentStep} 
          userData={userData}
          setCurrentStep={setCurrentStep}
          setUserData={setUserData}
        />
      ) : (
        <DashboardView userData={userData} />
      )}
    </div>
  );
};

export default RoomDetails;