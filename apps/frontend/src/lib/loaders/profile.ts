import { redirect } from 'react-router';
import type { AppointmentWithServices, User } from '@repo/shared';
import { api } from '@/lib/api';
import { auth } from '../auth';

export type ProfileLoaderData = {
  appointments: AppointmentWithServices[];
  user: User;
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
  return {
    appointments: appointmentsRes.data,
    user: userRes.data,
  };
}
