import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type BookingSuccessDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

export const BookingSuccessDialog = ({
  isOpen,
  onOpenChange,
}: BookingSuccessDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Tak for din booking</DialogTitle>
            <DialogClose asChild></DialogClose>
          </div>
          <DialogDescription className="mt-2">
            Du har modtaget en bekræftelse på e-mail.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
