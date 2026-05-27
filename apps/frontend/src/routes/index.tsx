import { createBrowserRouter, Navigate } from 'react-router';

import { AdminLayout } from '@/components/layout/admin-layout';
import { AuthLayout } from '@/components/layout/auth-layout';
import { BookingLayout } from '@/components/layout/booking-layout';
import { UserLayout } from '@/components/layout/user-layout';
import { AdminRoute } from '@/components/auth/admin-route';
import { ClientRoute } from '@/components/auth/client-route';
import { GuestRoute } from '@/components/auth/guest-route';
import { LandingPage } from '@/views/landing/pages/landing';
import { SignupPage } from '@/views/auth/pages/signup';
import { LoginPage } from '@/views/auth/pages/login';
import { ForgotPasswordPage } from '@/views/auth/pages/forgot-password';
import { ResetPasswordPage } from '@/views/auth/pages/reset-password';
import { TimeSelectPage } from '@/views/booking/pages/booking-time';
import { ConfirmationPage } from '@/views/booking/pages/booking-confirmation';
import { InformationPage } from '@/views/booking/pages/booking-information';
import { ServicesPage } from '@/views/booking/pages/booking-service';
import { AdminDashboardPage } from '@/views/admin/pages/dashboard';
import { ServicesPage as AdminServicesPage } from '@/views/admin/pages/services/services';
import { ServicePage } from '@/views/admin/pages/services/service';
import { CreateServicePage } from '@/views/admin/pages/services/create-service';
import { AvailabilityPage } from '@/views/admin/pages/availability/availability';
import { CreateAvailabilityPage } from '@/views/admin/pages/availability/create-availability';
import { AvailabilityDetailPage } from '@/views/admin/pages/availability/availability-detail';
import { UsersPage } from '@/views/admin/pages/users/users';
import { UserDetailPage } from '@/views/admin/pages/users/user-detail';
import { SettingsPage } from '@/views/admin/pages/settings/settings';
import { AppointmentsPage as AdminAppointmentsPage } from '@/views/admin/pages/appointments/appointments';
import { AppointmentDetailPage } from '@/views/admin/pages/appointments/appointment-detail';
import { AppointmentsPage } from '@/views/user/pages/appointments';
import { ProfilePage } from '@/views/user/pages/profile';
import { profileLoader } from '@/lib/loaders/profile';
import { NotFoundPage } from '@/views/not-found/pages/not-found';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },

  {
    element: (
      <GuestRoute>
        <AuthLayout />
      </GuestRoute>
    ),
    children: [
      {
        path: '/signup',
        element: <SignupPage />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: '/reset-password',
        element: <ResetPasswordPage />,
      },
    ],
  },

  {
    path: '/book',
    element: <BookingLayout />,
    children: [
      { index: true, element: <Navigate to="service" replace /> },
      { path: 'service', element: <ServicesPage /> },
      { path: 'time', element: <TimeSelectPage /> },
      { path: 'information', element: <InformationPage /> },
      { path: 'confirm', element: <ConfirmationPage /> },
    ],
  },

  {
    path: '/admin',
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'services', element: <AdminServicesPage /> },
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
      { path: 'appointments', element: <AdminAppointmentsPage /> },
      {
        path: 'appointments/:appointmentId',
        element: <AppointmentDetailPage />,
      },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },

  {
    path: '/profile',
    element: (
      <ClientRoute>
        <UserLayout />
      </ClientRoute>
    ),
    children: [
      {
        index: true,
        element: <ProfilePage />,
        loader: profileLoader,
      },
      {
        path: 'appointments',
        element: <AppointmentsPage />,
        loader: profileLoader,
      },
    ],
  },

  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
