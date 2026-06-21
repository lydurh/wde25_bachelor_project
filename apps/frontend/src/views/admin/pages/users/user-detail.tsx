import { useParams, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { AdminUser, Appointment, Location } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type ApiResponse<T> = { data: T };

const formatDate = (date: Date | string) =>
  new Date(date).toLocaleDateString('en-CA');

const formatTime = (time: string) => time.slice(0, 5);

const statusVariant = (
  status: string,
): 'default' | 'secondary' | 'outline' | 'destructive' => {
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

export const UserDetailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState<AdminUser | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, apptRes, locRes] = await Promise.all([
          api.get<ApiResponse<AdminUser>>(`/users/${userId}`),
          api.get<ApiResponse<Appointment[]>>('/appointments'),
          api.get<ApiResponse<Location[]>>('/locations'),
        ]);
        setUser(userRes.data);
        setNote(userRes.data.user_note ?? '');
        setLocations(locRes.data);
        const userAppointments = apptRes.data
          .filter((a) => a.appointment_user_fk === userId)
          .sort(
            (a, b) =>
              new Date(b.appointment_date).getTime() -
              new Date(a.appointment_date).getTime(),
          );
        setAppointments(userAppointments);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
  }, [userId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-destructive">{error}</p>;
  if (!user) return <p>User not found.</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => void navigate('/admin/users')}
      >
        &larr; Tilbage til brugere
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            {user.user_first_name} {user.user_last_name}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1 rounded-md border border-muted/20 bg-muted/5 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Email
            </p>
            <p>{user.user_email}</p>
          </div>
          <div className="space-y-1 rounded-md border border-muted/20 bg-muted/5 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Role
            </p>
            <Badge
              variant={user.user_role === 'admin' ? 'default' : 'secondary'}
            >
              {user.user_role}
            </Badge>
          </div>
          <div className="space-y-1 rounded-md border border-muted/20 bg-muted/5 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Lokation
            </p>
            <p>
              {user.user_location_fk
                ? (locations.find(
                    (l) => l.location_pk === user.user_location_fk,
                  )?.location_address ?? '—')
                : '—'}
            </p>
          </div>
          <div className="space-y-1 rounded-md border border-muted/20 bg-muted/5 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Verified
            </p>
            <p>
              {user.user_verified_at
                ? `Verified on ${formatDate(user.user_verified_at)}`
                : 'Not verified'}
            </p>
          </div>
          <div className="sm:col-span-2 space-y-1 rounded-md border border-muted/20 bg-muted/5 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Joined
            </p>
            <p>{formatDate(user.user_created_at)}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Noter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={note}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setNote(e.target.value)
            }
            placeholder="Tilføj noter om denne bruger..."
            rows={4}
          />
          <Button
            size="sm"
            disabled={savingNote || note === (user.user_note ?? '')}
            onClick={() => {
              setSavingNote(true);
              void api
                .patch(`/users/${userId}`, {
                  user_note: note || null,
                })
                .then(() => {
                  setUser({ ...user, user_note: note || null });
                })
                .catch(() => {
                  setError('Failed to save note');
                })
                .finally(() => {
                  setSavingNote(false);
                });
            }}
          >
            {savingNote ? 'Gemmer...' : 'Gem Note'}
          </Button>
        </CardContent>
      </Card>

      <Separator className="my-6" />

      <div>
        <h2 className="mb-4 text-lg font-semibold">
          Appointments ({appointments.length})
        </h2>

        {appointments.length === 0 ? (
          <p className="text-muted-foreground">Ingen aftaler fundet.</p>
        ) : (
          <Table className="w-full rounded-md bg-card">
            <TableHeader className="bg-secondary-background">
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appt) => (
                <TableRow key={appt.appointment_pk}>
                  <TableCell>{appt.appointment_date}</TableCell>
                  <TableCell>{formatTime(appt.appointment_time)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(appt.appointment_status)}>
                      {appt.appointment_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {appt.appointment_duration
                      ? `${appt.appointment_duration} min`
                      : '—'}
                  </TableCell>
                  <TableCell>
                    {appt.appointment_total_price
                      ? `$${appt.appointment_total_price}`
                      : '—'}
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
