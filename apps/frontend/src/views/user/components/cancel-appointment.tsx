import { useState } from 'react';
import type { Appointment, AppointmentStatus } from '@repo/shared';
import { api } from '@/lib/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';

const canCancel = (status: AppointmentStatus) => status === 'confirmed';

type CancelAppointmentProps = {
  appointmentPk: string;
  status: AppointmentStatus;
  onStatusChange: (status: AppointmentStatus) => void;
};

export const CancelAppointment = ({
  appointmentPk,
  status,
  onStatusChange,
}: CancelAppointmentProps) => {
  const [open, setOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  if (!canCancel(status)) return null;

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) setCancelError(null);
  };

  const handleConfirmCancel = async () => {
    setCancelling(true);
    setCancelError(null);
    try {
      const appointmentRes = await api.patch<{ data: Appointment }>(
        `/appointments/${appointmentPk}`,
        { appointment_status: 'cancelled' },
      );
      onStatusChange(appointmentRes.data.appointment_status);
      setOpen(false);
    } catch (err) {
      setCancelError(
        err instanceof Error ? err.message : 'Kunne ikke afbestille aftalen',
      );
    } finally {
      setCancelling(false);
    }
  };

  return (
    <CardFooter className="flex flex-col items-end gap-1">
      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-foreground/70 hover:bg-red-50 hover:text-red-700"
          >
            Afbestil
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Afbestil aftale?</AlertDialogTitle>
            <AlertDialogDescription>
              Er du sikker på, at du vil afbestille denne aftale? Handlingen kan
              ikke fortrydes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {cancelError && (
            <p className="text-sm text-destructive">{cancelError}</p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>Fortryd</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={cancelling}
              onClick={(e) => {
                e.preventDefault();
                void handleConfirmCancel();
              }}
            >
              {cancelling ? 'Afbestiller...' : 'Ja, afbestil'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CardFooter>
  );
};
