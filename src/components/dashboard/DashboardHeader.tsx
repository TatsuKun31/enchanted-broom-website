import { Button } from "@/components/ui/button";
import { EditProfileDialog } from "./EditProfileDialog";

interface DashboardHeaderProps {
  userName: string;
  onSignOut: () => void;
  userData: {
    name: string;
    phone: string;
    propertyType: string;
    address: string;
    frequency: string;
  };
  onUpdate: () => void;
}

export const DashboardHeader = ({ userName, onSignOut, userData, onUpdate }: DashboardHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold">Welcome back, {userName}</h1>
      <div className="flex items-center gap-2">
        <EditProfileDialog initialData={userData} onUpdate={onUpdate} />
        <Button variant="outline" onClick={onSignOut}>Sign Out</Button>
      </div>
    </div>
  );
};