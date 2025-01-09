import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  userName: string;
  onSignOut: () => void;
}

export const DashboardHeader = ({ userName, onSignOut }: DashboardHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold">Welcome back, {userName}</h1>
      <Button variant="outline" onClick={onSignOut}>Sign Out</Button>
    </div>
  );
};