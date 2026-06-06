import { useParams, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Appointment, AdminUser } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ApiResponse<T> = { data: T };

const formatDate = (date: string) => new Date(date).toLocaleDateString('en-CA');

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

export const AppointmentDetailPage = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [client, setClient] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apptRes = await api.get<ApiResponse<Appointment>>(
          `/appointments/${appointmentId}`,
        );
        setAppointment(apptRes.data);

        try {
          const userRes = await api.get<ApiResponse<AdminUser>>(
            `/users/${apptRes.data.appointment_user_fk}`,
          );
          setClient(userRes.data);
        } catch {
          // Client may not be accessible
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
  }, [appointmentId]);

  const handleCancel = async () => {
    if (!appointment) return;
    setCancelling(true);
    try {
      const res = await api.patch<ApiResponse<Appointment>>(
        `/appointments/${appointment.appointment_pk}`,
        { appointment_status: 'cancelled' },
      );
      setAppointment(res.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to cancel appointment',
      );
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-destructive">{error}</p>;
  if (!appointment) return <p>Aftaler ikke fundet</p>;

  return (
    <div className="mx-auto max-w-lg">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => void navigate('/admin/appointments')}
      >
        &larr; Tilbage til aftaler
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Appointment Details
            <Badge variant={statusVariant(appointment.appointment_status)}>
              {appointment.appointment_status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Dato</span>
            <span>{formatDate(appointment.appointment_date)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tid</span>
            <span>{appointment.appointment_time.slice(0, 5)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Varighed</span>
            <span>
              {appointment.appointment_duration
                ? `${appointment.appointment_duration} min`
                : '—'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pris</span>
            <span>
              {appointment.appointment_total_price
                ? `${appointment.appointment_total_price} kr`
                : '—'}
            </span>
          </div>
          {client && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Client</span>
              <span>
                {client.user_first_name} {client.user_last_name}
              </span>
            </div>
          )}
          {appointment.appointment_notes && (
            <div className="pt-2">
              <span className="text-muted-foreground">Noter</span>
              <p className="mt-1">{appointment.appointment_notes}</p>
            </div>
          )}
          <div className="flex justify-between pt-2 text-xs text-muted-foreground">
            <span>Oprettet</span>
            <span>{formatDate(appointment.appointment_created_at)}</span>
          </div>

          {appointment.appointment_status !== 'cancelled' && (
            <div className="pt-4">
              <Button
                variant="destructive"
                disabled={cancelling}
                onClick={() => void handleCancel()}
              >
                {cancelling ? 'Cancelling...' : 'Cancel Appointment'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
