import { Button } from "@/components/ui/button";

interface BookingActionsProps {
  totalPrice: number;
  onEdit: () => void;
  onCancel: () => void;
  isCancelling: boolean;
}

export const BookingActions = ({ totalPrice, onEdit, onCancel, isCancelling }: BookingActionsProps) => {
  return (
    <div className="flex justify-between items-center border-t border-purple-secondary/20 p-4">
      <p className="font-medium text-lg text-purple-primary">
        Total: ${totalPrice}
      </p>
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="border-purple-primary text-purple-primary hover:bg-purple-secondary/20"
          onClick={onEdit}
        >
          Make Changes
        </Button>
        <Button
          variant="destructive"
          className="hover:bg-destructive/90"
          onClick={onCancel}
          disabled={isCancelling}
        >
          {isCancelling ? "Cancelling..." : "Cancel Service"}
        </Button>
      </div>
    </div>
  );
};