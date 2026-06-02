import { redirect } from 'react-router';
import type { AppointmentWithServices, Location, User } from '@repo/shared';
import { api } from '@/lib/api';
import { auth } from '../auth';

export type ProfileLoaderData = {
  appointments: AppointmentWithServices[];
  user: User;
  location: Location | null;
};

export async function profileLoader() {
  const userId = auth.getUserId();
  if (!userId) return redirect('/login');

  const [appointmentsRes, userRes] = await Promise.all([
    api.get<{ data: AppointmentWithServices[] }>(
      `/appointments/list/${userId}`,
    ),
    api.get<{ data: User }>(`/users/${userId}`),
  ]);
  const user = userRes.data;

  if (!user.user_location_fk) {
    return {
      appointments: appointmentsRes.data,
      user,
      location: null,
    };
  }

  const locationRes = await api.get<{ data: Location }>(
    `/locations/${user.user_location_fk}`,
  );

  return {
    appointments: appointmentsRes.data,
    user,
    location: locationRes.data,
  };
}
