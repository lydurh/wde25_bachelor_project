import { useState } from 'react';
import type { ProfileLoaderData } from '@/lib/loaders/profile';
import { Link, useLoaderData } from 'react-router';
import {
  formatLocationAddress,
  type AppointmentWithServices,
} from '@repo/shared';
import { Home09Icon, Mail01Icon, User03Icon } from '@hugeicons/core-free-icons';
import { AppointmentCard } from '@/components/custom/appointment-card';
import { ItemGroup } from '@/components/ui/item';
import { EditUserDetailsForm } from '@/views/user/components/edit-user-details-form';
import { ProfileItem } from '@/views/user/components/profile-item';
import { Button } from '@/components/ui/button';

function getAppointmentStartsAt(appointment: AppointmentWithServices): Date {
  const time =
    appointment.appointment_time.length === 5
      ? appointment.appointment_time
      : appointment.appointment_time.slice(0, 8);
  return new Date(`${appointment.appointment_date}T${time}`);
}

function findNextAppointment(
  appointments: AppointmentWithServices[],
): AppointmentWithServices | undefined {
  const now = new Date();
  return appointments.find(
    (appointment) => getAppointmentStartsAt(appointment) >= now,
  );
}

export const ProfilePage = () => {
  const { appointments, user, location } = useLoaderData<ProfileLoaderData>();
  const [showAllAppointments, setShowAllAppointments] = useState(false);

  const nextAppointment = findNextAppointment(appointments);
  const showTimelineToggle = appointments.length > (nextAppointment ? 1 : 0);

  const originAddress = location
    ? formatLocationAddress({
        location_address: location.location_address,
        location_postal_code: location.location_postal_code,
        location_city: location.location_city,
      })
    : null;

  return (
    <main className="space-y-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">Hej {user.user_first_name}!</h1>
      <div className="flex flex-col gap-12">
        <section className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Dine oplysninger</h2>
            <EditUserDetailsForm user={user} />
          </div>
          <ItemGroup className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-white rounded-lg p-3 border border-border shadow-sm">
            <ProfileItem
              media={User03Icon}
              title="Navn"
              content={`${user.user_first_name} ${user.user_last_name}`}
            />
            <ProfileItem
              media={Mail01Icon}
              title="E-mail"
              content={user.user_email}
            />
            <ProfileItem
              media={Home09Icon}
              title="Adresse"
              content={originAddress ?? 'Ingen adresse angivet'}
              className="md:col-span-2"
            />
          </ItemGroup>
        </section>
        <section className="flex flex-col gap-2">
          <header className="flex items-center justify-between gap-2">
            <h2 className="text-xl font-semibold">
              {appointments.length === 0 ? 'Aftaler' : 'Din næste aftale'}
            </h2>
            <Button variant="default" asChild>
              <Link to="/book/service">book ny aftale</Link>
            </Button>
          </header>
          {appointments.length === 0 ? (
            <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              Du har ingen aftaler endnu.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {nextAppointment ? (
                <AppointmentCard appointment={nextAppointment} />
              ) : (
                <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                  Du har ingen kommende aftaler.
                </p>
              )}
              {showTimelineToggle && (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setShowAllAppointments((open) => !open)}
                >
                  {showAllAppointments
                    ? 'Skjul alle aftaler'
                    : 'Vis alle aftaler'}
                </Button>
              )}
              {showAllAppointments && (
                <section className="flex flex-col gap-2 pt-2">
                  <h3 className="text-lg font-semibold">Alle aftaler</h3>
                  <div className="flex flex-col gap-2">
                    {appointments.map((appointment) => (
                      <AppointmentCard
                        key={appointment.appointment_pk}
                        appointment={appointment}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};
