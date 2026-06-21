import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import type { Appointment, AdminUser, Location } from '@/types';
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

export const AppointmentsPage = () => {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
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
        const [apptRes, userRes, locRes] = await Promise.all([
          api.get<ApiResponse<Appointment[]>>('/appointments'),
          api.get<ApiResponse<AdminUser[]>>('/users'),
          api.get<ApiResponse<Location[]>>('/locations'),
        ]);
        setAppointments(apptRes.data);
        setUsers(userRes.data);
        setLocations(locRes.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
  }, []);

  const userMap = useMemo(() => {
    return new Map(users.map((u) => [u.user_pk, u]));
  }, [users]);

  const locationMap = useMemo(() => {
    return new Map(locations.map((l) => [l.location_pk, l]));
  }, [locations]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-destructive">{error}</p>;

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Aftaler</h1>
      </div>

      {appointments.length === 0 ? (
        <p className="text-muted-foreground">Ingen aftaler fundet.</p>
      ) : (
        <>
          <Table className="w-full rounded-md bg-card">
            <TableHeader>
              <TableRow>
                <TableHead>Kunde</TableHead>
                <TableHead className="hidden sm:table-cell">Lokation</TableHead>
                <TableHead>Dato</TableHead>
                <TableHead>Tid</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.map((appt) => {
                const user = userMap.get(appt.appointment_user_fk);
                const location = user?.user_location_fk
                  ? locationMap.get(user.user_location_fk)
                  : null;

                return (
                  <TableRow
                    key={appt.appointment_pk}
                    className="cursor-pointer"
                    onClick={() =>
                      void navigate(
                        `/admin/appointments/${appt.appointment_pk}`,
                      )
                    }
                  >
                    {/* Customer */}
                    <TableCell className="font-medium">
                      {user
                        ? `${user.user_first_name} ${user.user_last_name}`
                        : '—'}
                    </TableCell>

                    {/* Location */}
                    <TableCell className="hidden sm:table-cell">
                      {location?.location_address ?? '—'}
                    </TableCell>
                    <TableCell>{formatDate(appt.appointment_date)}</TableCell>
                    <TableCell>
                      {appt.appointment_time?.slice(0, 5) ?? '—'}
                    </TableCell>
                  </TableRow>
                );
              })}
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
