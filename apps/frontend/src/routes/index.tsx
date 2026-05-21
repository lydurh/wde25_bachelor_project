import { createBrowserRouter, Navigate } from 'react-router';

import { AdminLayout } from '@/components/layout/admin-layout';
import { AuthLayout } from '@/components/layout/auth-layout';
import { BookingLayout } from '@/components/layout/booking-layout';
import { UserLayout } from '@/components/layout/user-layout';
import { profileLoader } from '@/lib/loaders/profile';
import { AdminDashboardPage } from '@/views/admin/pages/dashboard';
import { LoginPage } from '@/views/auth/pages/login';
import { SignupPage } from '@/views/auth/pages/signup';
import { ConfirmationPage } from '@/views/booking/pages/booking-confirmation';
import { InformationPage } from '@/views/booking/pages/booking-information';
import { ServicesPage } from '@/views/booking/pages/booking-service';
import { TimeSelectPage } from '@/views/booking/pages/booking-time';
import { LandingPage } from '@/views/landing/pages/landing';
import { AppointmentsPage } from '@/views/user/pages/appointments';
import { ProfilePage } from '@/views/user/pages/profile';

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
    element: <AdminLayout />,
    children: [{ index: true, element: <AdminDashboardPage /> }],
  },
  {
    path: '/profile',
    element: <UserLayout />,
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
