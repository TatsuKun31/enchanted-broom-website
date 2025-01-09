import { CalendarDays, Clock } from "lucide-react";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

interface BookingHeaderProps {
  date: string;
  timeSlot: string;
  timeSlotMap: Record<string, string>;
}

export const BookingHeader = ({ date, timeSlot, timeSlotMap }: BookingHeaderProps) => {
  return (
    <Card className="mb-4 border border-purple-secondary/20 hover:border-purple-primary/30 transition-all duration-300 bg-purple-secondary/5 dark:bg-purple-dark/10">
      <CardHeader className="rounded-t-lg pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2 text-purple-primary">
          <CalendarDays className="h-5 w-5" />
          {format(new Date(date), "MMMM do, yyyy")}
          <span className="mx-2">•</span>
          <Clock className="h-5 w-5" />
          {timeSlotMap[timeSlot as keyof typeof timeSlotMap]}
        </CardTitle>
      </CardHeader>
    </Card>
  );
};