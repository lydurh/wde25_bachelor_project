import type { ProfileLoaderData } from '@/lib/loaders/profile';
import { useLoaderData } from 'react-router';
import { AppointmentCard } from '@/components/custom/appointment-card';

export const ProfilePage = () => {
  const { appointments, user } = useLoaderData<ProfileLoaderData>();

  return (
    <main className="space-y-8">
      <h1 className="text-3xl font-bold">Profile</h1>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold">Appointments</h2>
          {appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.appointment_pk}
              appointment={appointment}
            />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold">
            {user.user_first_name} {user.user_last_name}
          </h2>
        </div>
      </div>
    </main>
  );
};
