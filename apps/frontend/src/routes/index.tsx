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
import { TimeSelectPage } from '@/views/booking/pages/booking-time';
import { AdminDashboardPage } from '@/views/admin/pages/dashboard';
import { profileLoader } from '@/lib/loaders/profile';
import { LoginPage } from '@/views/auth/pages/login';
import { ConfirmationPage } from '@/views/booking/pages/booking-confirmation';
import { InformationPage } from '@/views/booking/pages/booking-information';
import { ServicesPage } from '@/views/booking/pages/booking-service';
import { AppointmentsPage } from '@/views/user/pages/appointments';
import { ProfilePage } from '@/views/user/pages/profile';
import { ForgotPasswordPage } from '@/views/auth/pages/forgot-password';
import { ResetPasswordPage } from '@/views/auth/pages/reset-password';
import { servicesLoader } from '@/lib/loaders/service';

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
      { path: 'service', element: <ServicesPage />, loader: servicesLoader },
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
