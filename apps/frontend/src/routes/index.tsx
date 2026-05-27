import { createBrowserRouter } from 'react-router';

import { AuthLayout } from '@/components/layout/auth-layout';
import { AdminLayout } from '@/components/layout/admin-layout';
import { BookingLayout } from '@/components/layout/booking-layout';
import { UserLayout } from '@/components/layout/user-layout';
import { LandingPage } from '@/views/landing/pages/landing';
import { SignupPage } from '@/views/auth/pages/signup';
import { TimeSelectPage } from '@/views/booking/pages/booking';
import { AdminDashboardPage } from '@/views/admin/pages/dashboard/dashboard';
import { ServicesPage } from '@/views/admin/pages/services/services';
import { ServicePage } from '@/views/admin/pages/services/service';
import { CreateServicePage } from '@/views/admin/pages/services/create-service';
import { AvailabilityPage } from '@/views/admin/pages/availability/availability';
import { CreateAvailabilityPage } from '@/views/admin/pages/availability/create-availability';
import { AvailabilityDetailPage } from '@/views/admin/pages/availability/availability-detail';
import { UsersPage } from '@/views/admin/pages/users/users';
import { UserDetailPage } from '@/views/admin/pages/users/user-detail';
import { SettingsPage } from '@/views/admin/pages/settings/settings';
import { AppointmentsPage } from '@/views/admin/pages/appointments/appointments';
import { AppointmentDetailPage } from '@/views/admin/pages/appointments/appointment-detail';
import { ProfilePage } from '@/views/user/pages/profile';
import { LoginPage } from '@/views/auth/pages/login';

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  {
    element: <AuthLayout />,
    children: [
      { path: '/signup', element: <SignupPage /> },
      { path: '/login', element: <LoginPage /> },
    ],
  },
  {
    path: '/book',
    element: <BookingLayout />,
    children: [{ path: 'time', element: <TimeSelectPage /> }],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'services', element: <ServicesPage /> },
      { path: 'services/new', element: <CreateServicePage /> },
      { path: 'services/:serviceId', element: <ServicePage /> },
      { path: 'availability', element: <AvailabilityPage /> },
      { path: 'availability/new', element: <CreateAvailabilityPage /> },
      {
        path: 'availability/:availabilityId',
        element: <AvailabilityDetailPage />,
      },
      { path: 'users', element: <UsersPage /> },
      { path: 'users/:userId', element: <UserDetailPage /> },
      { path: 'appointments', element: <AppointmentsPage /> },
      {
        path: 'appointments/:appointmentId',
        element: <AppointmentDetailPage />,
      },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  {
    path: '/dashboard',
    element: <UserLayout />,
    children: [{ path: 'profile', element: <ProfilePage /> }],
  },
]);
