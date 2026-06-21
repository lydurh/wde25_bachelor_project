import { useParams, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Appointment, AdminUser } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ApiResponse<T> = { data: T };

// Extended appointment type with optional services and location
type AppointmentDetail = Appointment & {
  services?: Array<{
    service_fk: string;
    quantity: number;
    service_title: string;
    service_description: string | null;
    service_duration: number;
    service_price: string;
  }>;
  location?: {
    location_pk: string;
    location_address: string;
    location_postal_code: string | null;
    location_city: string;
    location_country: string | null;
  } | null;
};

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

  const [appointment, setAppointment] = useState<AppointmentDetail | null>(
    null,
  );
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
      const res = await api.patch<ApiResponse<AppointmentDetail>>(
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
            Detaljer for aftale
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
          {appointment.location && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lokation</span>
              <span>
                {appointment.location.location_address}
                {appointment.location.location_city
                  ? ', ' + appointment.location.location_city
                  : ''}
              </span>
            </div>
          )}
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
          {appointment.services && appointment.services.length > 0 && (
            <div className="pt-2">
              <span className="text-muted-foreground block mb-2">Ydelser</span>
              <div className="space-y-1">
                {appointment.services.map((s) => (
                  <div key={s.service_fk} className="flex items-center gap-2">
                    <span>
                      {s.quantity > 1 ? `${s.quantity} × ` : ''}
                      {s.service_title}
                    </span>
                    <span>-</span>
                    <span>
                      {(parseFloat(s.service_price) * s.quantity).toFixed(2)} kr
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {client && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kunde</span>
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
                {cancelling ? 'Cancelling...' : 'Aflys Aftale'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
