import { redirect } from 'react-router';
import type { Appointment, Service, User } from '@repo/shared';
import { api } from '@/lib/api';
import { auth } from '../auth';

export type ProfileLoaderData = {
  appointments: Appointment[];
  services: Service[];
  user: User;
};

export async function profileLoader() {
  const userId = auth.getUserId();
  if (!userId) return redirect('/login');

  const [appointmentsRes, servicesRes, userRes] = await Promise.all([
    api.get<{ data: Appointment[] }>('/appointments'),
    api.get<{ data: Service[] }>('/services'),
    api.get<{ data: User }>(`/users/${userId}`),
  ]);
  return {
    appointments: appointmentsRes.data,
    services: servicesRes.data,
    user: userRes.data,
  };
}
