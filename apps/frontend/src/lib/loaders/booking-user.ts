import {
  parseAdminOrigin,
  parseBusinessSettings,
  type AdminOrigin,
  type BusinessSettings,
  type Location,
  type User,
} from '@repo/shared';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';

export type BookingUserLoaderData = {
  user: User | null;
  location: Location | null;
  adminOrigin: AdminOrigin | null;
  businessSettings: BusinessSettings | null;
};

export async function bookingUserLoader(): Promise<BookingUserLoaderData> {
  const adminOriginPromise = api
    .get<{ data: unknown }>('/locations/admin-origin')
    .then((res) => parseAdminOrigin(res.data))
    .catch((error: unknown) => {
      console.error('Failed to load admin origin', error);
      return null;
    });

  const businessSettingsPromise = api
    .get<{ data: unknown }>('/business-settings')
    .then((res) => parseBusinessSettings(res.data))
    .catch((error: unknown) => {
      console.error('Failed to load business settings', error);
      return null;
    });

  const userId = auth.getUserId();

  if (!userId) {
    const [adminOrigin, businessSettings] = await Promise.all([
      adminOriginPromise,
      businessSettingsPromise,
    ]);
    return { user: null, location: null, adminOrigin, businessSettings };
  }

  const userRes = await api.get<{ data: User }>(`/users/${userId}`);
  const user = userRes.data;

  if (!user.user_location_fk) {
    const [adminOrigin, businessSettings] = await Promise.all([
      adminOriginPromise,
      businessSettingsPromise,
    ]);
    return { user, location: null, adminOrigin, businessSettings };
  }

  const [locationRes, adminOrigin, businessSettings] = await Promise.all([
    api.get<{ data: Location }>(`/locations/${user.user_location_fk}`),
    adminOriginPromise,
    businessSettingsPromise,
  ]);

  return {
    user,
    location: locationRes.data,
    adminOrigin,
    businessSettings,
  };
}
