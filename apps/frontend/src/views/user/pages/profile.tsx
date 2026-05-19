import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { AppointmentCard } from '@/components/custom/appointment-card';
import type { Appointment } from '@repo/shared';
import { Link } from 'react-router';

const appointmentExample: Appointment = {
  appointment_pk: '1',
  appointment_user_fk: '1',
  location_fk: null,
  appointment_time: '10:00:00',
  appointment_date: '2026-01-01',
  appointment_notes: null,
  appointment_duration: 60,
  appointment_total_price: null,
  appointment_status: 'scheduled',
  appointment_created_at: '2026-01-01T09:00:00.000Z',
  appointment_updated_at: null,
  appointment_deleted_at: null,
};

export const ProfilePage = () => {
  return (
    <main className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold">Hi John Doe!</h1>
      </section>
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Your Profile</h2>
          <form>
            <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field className="md:col-span-1">
                <FieldLabel>First Name</FieldLabel>
                <Input type="text" placeholder="John" />
              </Field>
              <Field className="md:col-span-1">
                <FieldLabel>Last Name</FieldLabel>
                <Input type="text" placeholder="Doe" />
              </Field>
              <Field className="md:col-span-2">
                <FieldLabel>Email</FieldLabel>
                <Input type="email" placeholder="john.doe@example.com" />
              </Field>
              <Field className="md:col-span-2">
                <FieldLabel>Address</FieldLabel>
                <Input type="text" placeholder="123 Main St" />
              </Field>
              <Field className="md:col-span-2">
                <Button type="submit">Save</Button>
              </Field>
            </FieldGroup>
          </form>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Your Appointments</h2>
          <AppointmentCard appointment={appointmentExample} />
          <Button asChild variant="ghost" className="w-full">
            <Link to="/profile/appointments">All Appointments</Link>
          </Button>
        </div>
      </section>
    </main>
  );
};
