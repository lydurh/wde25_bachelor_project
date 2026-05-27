import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { api } from '@/lib/api';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import type { Appointment, Service, User } from '@/types';

type ApiResponse<T> = { data: T };

const statusVariant = (status: string) => {
  switch (status) {
    case 'pending':
      return 'outline';
    case 'confirmed':
      return 'default';
    case 'cancelled':
      return 'destructive';
    case 'completed':
      return 'secondary';
    default:
      return 'outline';
  }
};

export const AdminDashboardPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apptRes, svcRes, usrRes] = await Promise.all([
          api.get<ApiResponse<Appointment[]>>('/appointments'),
          api.get<ApiResponse<Service[]>>('/services'),
          api.get<ApiResponse<User[]>>('/users'),
        ]);
        setAppointments(apptRes.data);
        setServices(svcRes.data);
        setUsers(usrRes.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-destructive">{error}</p>;

  const pendingCount = appointments.filter(
    (a) => a.appointment_status === 'pending',
  ).length;
  const todayCount = appointments.filter(
    (a) => a.appointment_date === today,
  ).length;
  const recentAppointments = [...appointments]
    .sort((a, b) => b.appointment_date.localeCompare(a.appointment_date))
    .slice(0, 5);

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.user_pk === userId);
    return user ? `${user.user_first_name} ${user.user_last_name}` : userId;
  };

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-semibold">Welcome back!</h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pendingCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today&apos;s Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{todayCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{services.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{users.length}</p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Recent Appointments */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Recent Appointments</h2>
        {recentAppointments.length === 0 ? (
          <p className="text-muted-foreground">No appointments yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentAppointments.map((appt) => (
                <TableRow key={appt.appointment_pk}>
                  <TableCell>{getUserName(appt.appointment_user_fk)}</TableCell>
                  <TableCell>{appt.appointment_date}</TableCell>
                  <TableCell>{appt.appointment_time}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(appt.appointment_status)}>
                      {appt.appointment_status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Separator />

      {/* Quick Actions */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Quick Actions</h2>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link to="/admin/services">+ New Service</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/availability">+ Add Availability</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/users">View Users</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
