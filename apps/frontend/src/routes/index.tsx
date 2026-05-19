import { createBrowserRouter } from 'react-router';

import { AuthLayout } from '@/components/layout/auth-layout';
import { AdminLayout } from '@/components/layout/admin-layout';
import { BookingLayout } from '@/components/layout/booking-layout';
import { UserLayout } from '@/components/layout/user-layout';
import { LandingPage } from '@/views/landing/pages/landing';
import { SignupPage } from '@/views/auth/pages/signup';
import { TimeSelectPage } from '@/views/booking/pages/booking';
import { AdminDashboardPage } from '@/views/admin/pages/dashboard';
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
    children: [{ index: true, element: <AdminDashboardPage /> }],
  },
  {
    path: '/dashboard',
    element: <UserLayout />,
    children: [{ path: 'profile', element: <ProfilePage /> }],
  },
]);
