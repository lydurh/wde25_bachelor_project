import {
  formatLocationAddress,
  type AppointmentWithServices,
} from '@repo/shared';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

type AppointmentCardProps = {
  appointment: AppointmentWithServices;
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
      {appointment.location && (
        <CardContent>
          <p className="text-sm text-gray-500">
            <span className="font-bold">Location:</span>{' '}
            {formatLocationAddress(appointment.location)}
          </p>
        </CardContent>
      )}
      {appointment.services.length > 0 && (
        <CardContent>
          <p className="text-sm font-bold text-gray-700">Services</p>
          <ul className="mt-1 space-y-1 text-sm text-gray-500">
            {appointment.services.map((line) => (
              <li key={line.service_fk}>
                {line.service_title}
                {line.quantity > 1 ? ` × ${line.quantity}` : ''} —{' '}
                {line.service_price} kr
              </li>
            ))}
          </ul>
        </CardContent>
      )}
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
