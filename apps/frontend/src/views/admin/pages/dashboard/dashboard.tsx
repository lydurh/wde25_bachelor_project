import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { api } from '@/lib/api';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

  const upcomingCount = appointments.filter(
    (a) => a.appointment_status === 'confirmed',
  ).length;
  const todayAppointments = appointments
    .filter((a) => a.appointment_date === today)
    .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.user_pk === userId);
    return user ? `${user.user_first_name} ${user.user_last_name}` : userId;
  };

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-semibold">Velkommen tilbage!</h1>
        <p className="text-muted-foreground">Din oversigt.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Link to="/admin/appointments">
          <Card className="transition-colors hover:bg-accent">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Kommende Aftaler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{upcomingCount}</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/services">
          <Card className="transition-colors hover:bg-accent">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{services.length}</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/users">
          <Card className="transition-colors hover:bg-accent">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Brugere
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{users.length}</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Separator />

      {/* Recent Appointments */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Dagens Aftaler</h2>
        {todayAppointments.length === 0 ? (
          <p className="text-muted-foreground">Ingen aftaler i dag.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kunde</TableHead>
                <TableHead>Dato</TableHead>
                <TableHead>Tid</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {todayAppointments.map((appt) => (
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
    </div>
  );
};
