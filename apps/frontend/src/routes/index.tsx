import { createBrowserRouter, Navigate } from 'react-router';

import { AdminRoute } from '@/components/auth/admin-route';
import { ClientRoute } from '@/components/auth/client-route';
import { GuestRoute } from '@/components/auth/guest-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { AppLayout } from '@/components/layout/app-layout';
import { AuthLayout } from '@/components/layout/auth-layout';
import { BookingLayout } from '@/components/layout/booking-layout';
import { UserLayout } from '@/components/layout/user-layout';

import { availabilityLoader } from '@/lib/loaders/availability';
import { bookingUserLoader } from '@/lib/loaders/booking-user';
import { profileLoader } from '@/lib/loaders/profile';
import { servicesLoader } from '@/lib/loaders/service';

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

import { LoginPage } from '@/views/auth/pages/login';
import { SignupPage } from '@/views/auth/pages/signup';
import { ForgotPasswordPage } from '@/views/auth/pages/forgot-password';
import { ResetPasswordPage } from '@/views/auth/pages/reset-password';

import { ConfirmationPage } from '@/views/booking/pages/booking-confirmation';
import { LocationPage } from '@/views/booking/pages/booking-location';
import { ServicesPage } from '@/views/booking/pages/booking-service';
import { TimeSelectPage } from '@/views/booking/pages/booking-time';
import { AdminFetchUsersPage } from '@/views/booking/pages/booking-fetch-users';

import { ProfilePage } from '@/views/user/pages/profile';

import { NotFoundPage } from '@/views/not-found/pages/not-found';

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        index: true,
        path: '/',
        element: <Navigate to="/login" replace />,
        handle: { title: 'Login' },
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
            handle: { title: 'Sign up' },
          },
          {
            path: '/login',
            element: <LoginPage />,
            handle: { title: 'Login' },
          },
          {
            path: '/forgot-password',
            element: <ForgotPasswordPage />,
            handle: { title: 'Forgot password' },
          },
          {
            path: '/reset-password',
            element: <ResetPasswordPage />,
            handle: { title: 'Reset password' },
          },
        ],
      },

      {
        path: '/book',
        id: 'book',
        element: <BookingLayout />,
        loader: bookingUserLoader,
        children: [
          { index: true, element: <Navigate to="service" replace /> },
          {
            path: 'service',
            element: <ServicesPage />,
            loader: servicesLoader,
            handle: { title: 'Choose service' },
          },
          {
            path: 'user',
            element: <AdminFetchUsersPage />,
            handle: { title: 'Select user' },
          },
          {
            path: 'location',
            element: <LocationPage />,
            handle: { title: 'Choose location' },
          },
          {
            path: 'time',
            element: <TimeSelectPage />,
            loader: availabilityLoader,
            handle: { title: 'Select time' },
          },
          {
            path: 'confirm',
            element: <ConfirmationPage />,
            handle: { title: 'Confirm booking' },
          },
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
          {
            index: true,
            element: <AdminDashboardPage />,
            handle: { title: 'Admin dashboard' },
          },
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
            handle: { title: 'My profile' },
          },
        ],
      },
    ],
  },

  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
