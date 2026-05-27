import {
  parseAdminOrigin,
  type AdminOrigin,
  type Location,
  type User,
} from '@repo/shared';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';

export type BookingUserLoaderData = {
  user: User | null;
  location: Location | null;
  adminOrigin: AdminOrigin | null;
};

export async function bookingUserLoader(): Promise<BookingUserLoaderData> {
  const adminOriginPromise = api
    .get<{ data: unknown }>('/locations/admin-origin')
    .then((res) => parseAdminOrigin(res.data))
    .catch((error: unknown) => {
      console.error('Failed to load admin origin', error);
      return null;
    });

  const userId = auth.getUserId();

  if (!userId) {
    return {
      user: null,
      location: null,
      adminOrigin: await adminOriginPromise,
    };
  }

  const userRes = await api.get<{ data: User }>(`/users/${userId}`);
  const user = userRes.data;

  if (!user.user_location_fk) {
    return {
      user,
      location: null,
      adminOrigin: await adminOriginPromise,
    };
  }

  const [locationRes, adminOrigin] = await Promise.all([
    api.get<{ data: Location }>(`/locations/${user.user_location_fk}`),
    adminOriginPromise,
  ]);

  return { user, location: locationRes.data, adminOrigin };
}
