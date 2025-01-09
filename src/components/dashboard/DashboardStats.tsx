import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Home } from "lucide-react";
import { ServiceBookingModal } from "./ServiceBookingModal";
import { useState } from "react";

interface DashboardStatsProps {
  nextService?: string;
  frequency: string;
  propertyType: string;
}

export const DashboardStats = ({ nextService, frequency, propertyType }: DashboardStatsProps) => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card className="bg-white dark:bg-purple-dark/40">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Next Service</CardTitle>
          <Calendar className="h-4 w-4 text-purple-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{nextService || "Not scheduled"}</div>
        </CardContent>
      </Card>
      
      <Card className="bg-white dark:bg-purple-dark/40">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Service Type</CardTitle>
          <Clock className="h-4 w-4 text-purple-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold capitalize">{frequency}</div>
        </CardContent>
      </Card>
      
      <Card className="bg-white dark:bg-purple-dark/40">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Property Type</CardTitle>
          <Home className="h-4 w-4 text-purple-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold capitalize">{propertyType}</div>
        </CardContent>
      </Card>
      
      <Card 
        className="cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-purple-primary to-purple-600 text-white" 
        onClick={() => setIsBookingModalOpen(true)}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">Book Service</CardTitle>
          <Calendar className="h-4 w-4 text-white" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Schedule Now</div>
        </CardContent>
      </Card>

      <ServiceBookingModal
        open={isBookingModalOpen}
        onOpenChange={setIsBookingModalOpen}
      />
    </div>
  );
};