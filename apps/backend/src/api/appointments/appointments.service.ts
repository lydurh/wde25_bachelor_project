import {
  type Appointment,
  type CreateAppointmentInput,
  type UpdateAppointmentInput,
  parseAppointment,
} from '@repo/shared';

const samples: Appointment[] = [
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

// TODO: Add a function to check if the appointment is active (eg. the appointment_deleted_at is null)

export const appointmentsService = {
  list(): Appointment[] {
    return samples.map((row) => parseAppointment(row));
  },

  get(id: string): Promise<Appointment | undefined> {
    const row = samples.find((r) => r.appointment_pk === id);
    return Promise.resolve(row ? parseAppointment(row) : undefined);
  },

  delete(id: string): Promise<Appointment | undefined> {
    if (!id) {
      return Promise.resolve(undefined);
    }
    const index = samples.findIndex((r) => r.appointment_pk === id);
    if (index === -1) {
      return Promise.resolve(undefined);
    }
    const row = samples[index];
    const deletedAppointment = parseAppointment({
      ...row,
      appointment_deleted_at: new Date().toISOString(),
    });
    return Promise.resolve(deletedAppointment);
  },

  post(input: CreateAppointmentInput): Promise<Appointment> {
    const newAppointment = parseAppointment({
      ...input,
      appointment_pk: crypto.randomUUID(),
      appointment_status: 'pending',
      appointment_created_at: new Date().toISOString(),
      appointment_updated_at: null,
      appointment_deleted_at: null,
    });
    samples.push(newAppointment);
    return Promise.resolve(newAppointment);
  },

  patch(
    id: string,
    input: UpdateAppointmentInput,
  ): Promise<Appointment | undefined> {
    const index = samples.findIndex((r) => r.appointment_pk === id);
    if (index === -1) {
      return Promise.resolve(undefined);
    }

    const row = samples[index];
    const updatedAppointment = parseAppointment({
      ...row,
      ...input,
      appointment_updated_at: new Date().toISOString(),
    });
    samples[index] = updatedAppointment;
    return Promise.resolve(updatedAppointment);
  },
};
