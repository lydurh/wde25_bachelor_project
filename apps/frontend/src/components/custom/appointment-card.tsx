import type { Appointment } from '@repo/shared';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

type AppointmentCardProps = {
  appointment: Appointment;
};

export const AppointmentCard = ({ appointment }: AppointmentCardProps) => {
  return (
    <Card className="bg-white rounded-lg shadow-md p-4">
      <CardHeader>
        <CardTitle>
          {appointment.appointment_time} - {appointment.appointment_date}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500">
          <span className="font-bold">Date:</span>{' '}
          {appointment.appointment_date}
        </p>
      </CardContent>
      <CardContent>
        <p className="text-sm text-gray-500">
          <span className="font-bold">Created at:</span>{' '}
          {new Date(appointment.appointment_created_at).toLocaleString()}
        </p>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-gray-500">
          <span className="font-bold">Time:</span>{' '}
          {appointment.appointment_time}
        </p>
      </CardFooter>
    </Card>
  );
};
