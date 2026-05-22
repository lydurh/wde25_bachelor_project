import { redirect } from 'react-router';
import type { Appointment } from '@repo/shared';
import { api } from '@/lib/api';

export type ProfileLoaderData = {
  appointments: Appointment[];
};

export async function profileLoader() {
  const token = localStorage.getItem('token');
  if (!token) return redirect('/login');

  const { data } = await api.get<{ data: Appointment[] }>(
    '/appointments',
    token,
  );
  return { appointments: data };
}
