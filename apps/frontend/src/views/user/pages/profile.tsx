import type { ProfileLoaderData } from '@/lib/loaders/profile';
import { useLoaderData } from 'react-router';
import { AppointmentCard } from '@/components/custom/appointment-card';
import { EditUserDetailsForm } from '@/views/user/components/edit-user-details-form';

export const ProfilePage = () => {
  const { appointments, user } = useLoaderData<ProfileLoaderData>();

  return (
    <main className="space-y-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">Profile</h1>
      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold">Dine oplysninger</h2>
              <p className="text-sm text-muted-foreground">
                {user.user_first_name} {user.user_last_name}
              </p>
              <p className="text-sm text-muted-foreground">{user.user_email}</p>
            </div>
            <EditUserDetailsForm user={user} />
          </div>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold">Dine aftaler</h2>
          {appointments.length === 0 ? (
            <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              Du har ingen aftaler endnu.
            </p>
          ) : (
            appointments.map((appointment) => (
              <AppointmentCard
                key={appointment.appointment_pk}
                appointment={appointment}
              />
            ))
          )}
        </section>
      </div>
    </main>
  );
};
