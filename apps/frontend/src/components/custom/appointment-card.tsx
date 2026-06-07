import { useState } from 'react';
import {
  type AppointmentServiceLine,
  type AppointmentWithServices,
  type AppointmentStatus,
} from '@repo/shared';
import { CancelAppointment } from '@/views/user/components/cancel-appointment';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Item, ItemGroup, ItemTitle } from '../ui/item';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Appointment02Icon,
  CoinsDollarIcon,
  Location04Icon,
  ScissorIcon,
  Comment03Icon,
} from '@hugeicons/core-free-icons';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';
import { Badge } from '../ui/badge';
import { ProfileItem } from '@/views/user/components/profile-item';

type AppointmentCardProps = {
  appointment: AppointmentWithServices;
};

const formatServices = (services: AppointmentServiceLine[]) => {
  return services
    .map((service) =>
      service.quantity > 1
        ? `${service.quantity} × ${service.service_title}`
        : service.service_title,
    )
    .join(', ');
};

const formatAppointmentDate = (date: string) => {
  return format(new Date(date), 'd. MMM yyyy', { locale: da });
};

const formatAppointmentStatus = (status: AppointmentStatus) => {
  switch (status) {
    case 'confirmed':
      return (
        <Badge
          variant="outline"
          className="text-xs bg-green-50 text-green-700 border-green-200"
        >
          Bestilt
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge
          variant="outline"
          className="text-xs bg-red-50 text-red-700 border-red-200"
        >
          Annulleret
        </Badge>
      );
    case 'completed':
      return (
        <Badge
          variant="outline"
          className="text-xs bg-green-50 text-green-700 border-green-200"
        >
          Afsluttet
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="text-xs bg-gray-50 text-gray-700 border-gray-200"
        >
          Ukendt
        </Badge>
      );
  }
};

export const AppointmentCard = ({ appointment }: AppointmentCardProps) => {
  const [status, setStatus] = useState(appointment.appointment_status);

  return (
    <Card className="bg-white rounded-lg shadow-sm">
      <CardHeader>
        <CardTitle>
          <ItemGroup>
            <Item>
              <HugeiconsIcon
                icon={Appointment02Icon}
                size={36}
                strokeWidth={2}
              />
              <ItemTitle className="font-semibold text-xl flex flex-col gap-1 items-start">
                {formatAppointmentStatus(status)}
                {formatAppointmentDate(appointment.appointment_date)} -{' '}
                {appointment.appointment_time}
              </ItemTitle>
            </Item>
          </ItemGroup>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ItemGroup className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <ProfileItem
            media={Location04Icon}
            title={
              appointment.location?.location_address ?? 'Ingen adresse fundet'
            }
            className="md:col-span-3"
          />
          <ProfileItem
            media={ScissorIcon}
            title="Services:"
            content={formatServices(appointment.services)}
          />
          <ProfileItem
            media={Comment03Icon}
            title="Kommentar:"
            content={appointment.appointment_notes ?? 'Ingen kommentar'}
          />
          <ProfileItem
            media={CoinsDollarIcon}
            title="Pris:"
            content={`${appointment.appointment_total_price},-`}
          />
        </ItemGroup>
      </CardContent>
      <CancelAppointment
        appointmentPk={appointment.appointment_pk}
        status={status}
        onStatusChange={setStatus}
      />
    </Card>
  );
};
