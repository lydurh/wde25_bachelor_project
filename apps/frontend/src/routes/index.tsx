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
import { ForgotPasswordPage } from '@/views/auth/pages/forgot-password';
import { LoginPage } from '@/views/auth/pages/login';
import { ResetPasswordPage } from '@/views/auth/pages/reset-password';
import { SignupPage } from '@/views/auth/pages/signup';
import { ConfirmationPage } from '@/views/booking/pages/booking-confirmation';
import { LocationPage } from '@/views/booking/pages/booking-location';
import { ServicesPage } from '@/views/booking/pages/booking-service';
import { TimeSelectPage } from '@/views/booking/pages/booking-time';
import { AppointmentsPage } from '@/views/user/pages/appointments';
import { ProfilePage } from '@/views/user/pages/profile';
import { AdminFetchUsersPage } from '@/views/booking/pages/booking-fetch-users';

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
          {
            path: 'appointments',
            element: <AppointmentsPage />,
            loader: profileLoader,
            handle: { title: 'My appointments' },
          },
        ],
      },
    ],
  },
]);
