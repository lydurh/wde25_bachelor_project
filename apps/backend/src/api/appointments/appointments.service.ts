import type { Appointment } from '@repo/shared';

const sampleAppointments: Appointment[] = [
  {
    appointment_pk: '1',
    appointment_user_fk: '1',
    location_fk: '1',
    appointment_time: '10:00',
    appointment_date: '2026-01-01',
    appointment_notes: 'Notes',
    appointment_duration: 60,
    appointment_total_price: '100',
    appointment_status: 'pending',
    appointment_created_at: '2026-01-01',
    appointment_updated_at: '2026-01-01',
    appointment_deleted_at: null,
  },
  {
    appointment_pk: '2',
    appointment_user_fk: '2',
    location_fk: '2',
    appointment_time: '11:00',
    appointment_date: '2026-01-02',
    appointment_notes: 'Notes',
    appointment_duration: 60,
    appointment_total_price: '100',
    appointment_status: 'pending',
    appointment_created_at: '2026-01-02',
    appointment_updated_at: '2026-01-02',
    appointment_deleted_at: null,
  },
];

export const appointmentsService = {
  list(): Appointment[] {
    return sampleAppointments;
  },
};