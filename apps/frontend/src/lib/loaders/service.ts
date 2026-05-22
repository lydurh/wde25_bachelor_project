import { redirect } from 'react-router';
import type { Service } from '@repo/shared';
import { api } from '@/lib/api';

export type ServicesLoaderData = {
  services: Service[];
};

export async function servicesLoader() {
  const token = localStorage.getItem('token');
  if (!token) return redirect('/login');

  const { data } = await api.get<{ data: Service[] }>('/services');
  return { services: data };
}
