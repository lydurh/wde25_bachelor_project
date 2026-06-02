import {
  type LocationAddressParts,
  type AppointmentServiceLine,
  type AppointmentWithServices,
} from '@repo/shared';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
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
import { Separator } from '../ui/separator';

type AppointmentCardProps = {
  appointment: AppointmentWithServices;
};

type AppointmentItemProps = {
  media?: IconSvgElement;
  title: string;
  content?: string | number;
};

const formatAddress = (address: LocationAddressParts | null) => {
  if (!address) return 'Ingen adresse fundet';
  const cityLine = [address.location_postal_code, address.location_city]
    .filter(Boolean)
    .join(', ');

  return cityLine
    ? `${address.location_address}\n${cityLine}`
    : address.location_address;
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
  return format(new Date(date), 'd. MMM yyyy');
};

const AppointmentItem = ({ media, title, content }: AppointmentItemProps) => {
  return (
    <Item>
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
  return (
    <Card className="bg-white rounded-lg shadow-md">
      <CardHeader>
        <CardTitle>
          <Item>
            <HugeiconsIcon icon={Appointment02Icon} size={36} strokeWidth={2} />
            <ItemContent>
              <ItemTitle className="font-semibold text-xl">
                {formatAppointmentDate(appointment.appointment_date)} -{' '}
                {appointment.appointment_time}
              </ItemTitle>
            </ItemContent>
          </Item>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ItemGroup className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <AppointmentItem
            media={Location04Icon}
            title="Sted:"
            content={formatAddress(appointment.location)}
          />
          <AppointmentItem
            media={CoinsDollarIcon}
            title="Pris:"
            content={`${appointment.appointment_total_price},-`}
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
        </ItemGroup>
      </CardContent>
      <Separator className="my-4" />
      <CardFooter>footer here</CardFooter>
    </Card>
  );
};
