import { useState } from 'react';
import {
  type AppointmentServiceLine,
  type AppointmentWithServices,
  type AppointmentStatus,
} from '@repo/shared';
import { CancelAppointment } from '@/views/user/components/cancel-appointment';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '../ui/item';
import { HugeiconsIcon } from '@hugeicons/react';
import type { IconSvgElement } from '@hugeicons/react';
import {
  Appointment02Icon,
  CoinsDollarIcon,
  Location04Icon,
  ScissorIcon,
  Comment03Icon,
} from '@hugeicons/core-free-icons';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

type AppointmentCardProps = {
  appointment: AppointmentWithServices;
};

type AppointmentItemProps = {
  media?: IconSvgElement;
  title: string;
  content?: string | number;
  className?: string;
};

// const formatAddress = (address: LocationAddressParts | null) => {
//   if (!address) return 'Ingen adresse fundet';
//   const cityLine = [address.location_postal_code, address.location_city]
//     .filter(Boolean)
//     .join(', ');

//   return cityLine
//     ? `${address.location_address}\n${cityLine}`
//     : address.location_address;
// };

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
    case 'pending':
      return (
        <Badge
          variant="outline"
          className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200"
        >
          Afventer
        </Badge>
      );
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

const AppointmentItem = ({
  media,
  title,
  content,
  className,
}: AppointmentItemProps) => {
  return (
    <Item className={cn(className)}>
      {media && (
        <ItemMedia>
          <HugeiconsIcon icon={media} size={18} strokeWidth={2} />
        </ItemMedia>
      )}
      <ItemContent>
        <ItemTitle className="font-semibold">{title}</ItemTitle>
        {content && (
          <ItemDescription className="whitespace-pre-line text-foreground/70">
            {content}
          </ItemDescription>
        )}
      </ItemContent>
    </Item>
  );
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
          <AppointmentItem
            media={Location04Icon}
            title={
              appointment.location?.location_address ?? 'Ingen adresse fundet'
            }
            className="md:col-span-3"
          />
          <AppointmentItem
            media={ScissorIcon}
            title="Services:"
            content={formatServices(appointment.services)}
          />
          <AppointmentItem
            media={Comment03Icon}
            title="Kommentar:"
            content={appointment.appointment_notes ?? 'Ingen kommentar'}
          />
          <AppointmentItem
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
