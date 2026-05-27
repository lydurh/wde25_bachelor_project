import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import type { Appointment } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type ApiResponse<T> = { data: T };

const formatDate = (date: string) => new Date(date).toLocaleDateString('en-CA');

const statusVariant = (
  status: string,
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'confirmed':
      return 'default';
    case 'completed':
      return 'outline';
    case 'cancelled':
      return 'destructive';
    default:
      return 'secondary';
  }
};

export const AppointmentsPage = () => {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get<ApiResponse<Appointment[]>>('/appointments');
        setAppointments(res.data);
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

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1>Appointments</h1>
      </div>

      {appointments.length === 0 ? (
        <p className="text-muted-foreground">No appointments found.</p>
      ) : (
        <Table className="w-full rounded-md bg-card">
          <TableHeader className="bg-secondary-background">
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appt) => (
              <TableRow
                key={appt.appointment_pk}
                className="cursor-pointer"
                onClick={() =>
                  void navigate(`/admin/appointments/${appt.appointment_pk}`)
                }
              >
                <TableCell>{formatDate(appt.appointment_date)}</TableCell>
                <TableCell>{appt.appointment_time}</TableCell>
                <TableCell>
                  {appt.appointment_duration
                    ? `${appt.appointment_duration} min`
                    : '—'}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant(appt.appointment_status)}>
                    {appt.appointment_status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {appt.appointment_total_price
                    ? `${appt.appointment_total_price} kr`
                    : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
