import { createBrowserRouter } from 'react-router';

import { AuthLayout } from '@/components/layout/auth-layout';
import { AdminLayout } from '@/components/layout/admin-layout';
import { BookingLayout } from '@/components/layout/booking-layout';
import { UserLayout } from '@/components/layout/user-layout';
import { AdminRoute } from '@/components/auth/admin-route';
import { ClientRoute } from '@/components/auth/client-route';
import { GuestRoute } from '@/components/auth/guest-route';
import { LandingPage } from '@/views/landing/pages/landing';
import { SignupPage } from '@/views/auth/pages/signup';
import { TimeSelectPage } from '@/views/booking/pages/booking';
import { AdminDashboardPage } from '@/views/admin/pages/dashboard';
import { profileLoader } from '@/lib/loaders/profile';
import { ProfilePage } from '@/views/user/pages/profile';
import { AppointmentsPage } from '@/views/user/pages/appointments';
import { LoginPage } from '@/views/auth/pages/login';
import { ForgotPasswordPage } from '@/views/auth/pages/forgot-password';
import { ResetPasswordPage } from '@/views/auth/pages/reset-password';

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
      {
        path: 'time',
        element: <TimeSelectPage />,
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
      },
      {
        path: 'appointments',
        element: <AppointmentsPage />,
        loader: profileLoader,
      },
    ],
  },
]);
