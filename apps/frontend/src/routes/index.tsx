import { createBrowserRouter } from 'react-router';

import { AdminRoute } from '@/components/auth/admin-route';
import { ClientRoute } from '@/components/auth/client-route';
import { GuestRoute } from '@/components/auth/guest-route';
import { AdminLayout } from '@/components/layout/admin-layout';
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
import { InformationPage } from '@/views/booking/pages/booking-information';
import { LocationPage } from '@/views/booking/pages/booking-location';
import { ServicesPage } from '@/views/booking/pages/booking-service';
import { TimeSelectPage } from '@/views/booking/pages/booking-time';
import { LandingPage } from '@/views/landing/pages/landing';
import { AppointmentsPage } from '@/views/user/pages/appointments';
import { ProfilePage } from '@/views/user/pages/profile';
import { InitialbookingPage } from '@/views/booking/pages/booking-initial';

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
    id: 'book',
    element: <BookingLayout />,
    loader: bookingUserLoader,
    children: [
      { index: true, element: <InitialbookingPage /> },
      { path: 'service', element: <ServicesPage />, loader: servicesLoader },
      { path: 'location', element: <LocationPage /> },
      { path: 'information', element: <InformationPage /> },
      { path: 'time', element: <TimeSelectPage />, loader: availabilityLoader },
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
