import Navigation from "./Navigation";

export const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-purple-dark/20 dark:to-purple-dark/40">
      <Navigation />
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-primary"></div>
      </div>
    </div>
  );
};