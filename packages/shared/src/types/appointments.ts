export type Appointment = {
  appointment_pk: string;
  appointment_user_fk: string;
  location_fk: string | null;
  appointment_time: string;
  appointment_date: string;
  appointment_notes: string | null;
  appointment_duration: number | null;
  appointment_total_price: string | null;
  appointment_status: string;
  appointment_created_at: string;
  appointment_updated_at: string | null;
  appointment_deleted_at: string | null;
};