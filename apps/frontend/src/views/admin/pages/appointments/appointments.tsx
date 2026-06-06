import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

const PAGE_SIZE = 10;
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
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(appointments.length / PAGE_SIZE);
  const pageItems = appointments.slice(
    page * PAGE_SIZE,
    (page + 1) * PAGE_SIZE,
  );

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
        <h1>Aftaler</h1>
      </div>

      {appointments.length === 0 ? (
        <p className="text-muted-foreground">Ingen aftaler fundet.</p>
      ) : (
        <>
          <Table className="w-full rounded-md bg-card">
            <TableHeader className="bg-secondary-background">
              <TableRow>
                <TableHead>Dato</TableHead>
                <TableHead>Tid</TableHead>
                <TableHead>Varighed</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pris</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.map((appt) => (
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

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                Tidligere
              </Button>
              <span className="text-sm text-muted-foreground">
                Side {page + 1} ud af {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
              >
                Forsæt
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
