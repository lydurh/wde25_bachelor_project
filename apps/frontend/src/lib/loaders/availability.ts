import { redirect } from 'react-router';
import type { Availability } from '@repo/shared';
import { api } from '@/lib/api';

export type AvailabilityLoaderData = {
  availabilities: Availability[];
};

export async function availabilityLoader() {
  const token = localStorage.getItem('token');
  if (!token) return redirect('/login');

  const today = new Date().toISOString().slice(0, 10);
  const { data } = await api.get<{ data: Availability[] }>(
    `/availability?from=${today}`,
  );
  return { availabilities: data };
}
