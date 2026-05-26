import type { Location, User } from '@repo/shared';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
// import { getAdminLocation } from '@/services/location.service';

export type BookingUserLoaderData = {
  user: User | null;
  location: Location | null;
};

export async function bookingUserLoader(): Promise<BookingUserLoaderData> {
  const userId = auth.getUserId();
  // const adminLocation = await getAdminLocation();

  if (!userId) {
    return { user: null, location: null };
  }

  // const [ userRes, adminRes ] = {
  //  await api.get<{ data: User }>(`/users/${userId}`);
  // await api.get<{ data: Location }>(`/locations/${adminLocation.location_pk}`),

  // }
  const userRes = await api.get<{ data: User }>(`/users/${userId}`);
  const user = userRes.data;

  if (!user.user_location_fk) {
    return { user, location: null };
  }

  const locationRes = await api.get<{ data: Location }>(
    `/locations/${user.user_location_fk}`,
  );

  return { user, location: locationRes.data };
}
