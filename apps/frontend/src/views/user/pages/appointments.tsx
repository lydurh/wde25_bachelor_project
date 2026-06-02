import { AppointmentCard } from '@/components/custom/appointment-card';
import type { AppointmentWithServices } from '@repo/shared';

const appointmentExample: AppointmentWithServices = {
  appointment_pk: '1',
  appointment_user_fk: '1',
  location_fk: null,
  appointment_time: '10:00:00',
  appointment_date: '2026-01-01',
  appointment_notes: null,
  appointment_duration: 60,
  appointment_total_price: null,
  appointment_status: 'confirmed',
  appointment_created_at: '2026-01-01T09:00:00.000Z',
  appointment_updated_at: null,
  appointment_deleted_at: null,
  services: [],
};

export const AppointmentsPage = () => {
  return (
    <main className="space-y-8">
      <h1 className="text-3xl font-bold">Your Appointments</h1>
      <AppointmentCard appointment={appointmentExample} />
    </main>
  );
};
