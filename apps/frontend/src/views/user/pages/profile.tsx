import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { AppointmentCard } from '@/components/custom/appointment-card';
import type { ProfileLoaderData } from '@/lib/loaders/profile';
import { Link, useLoaderData } from 'react-router';
import { useState } from 'react';

export const ProfilePage = () => {
  const [editing, setEditing] = useState(false);
  const { appointments } = useLoaderData<ProfileLoaderData>();
  const nextAppointment = appointments[0];

  return (
    <main className="space-y-8">
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Your Profile</h2>
            <Button
              variant="outline"
              size="xs"
              onClick={() => setEditing(!editing)}
            >
              {editing ? 'Cancel' : 'Edit'}
            </Button>
          </div>
          <form>
            <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field className="md:col-span-1">
                <FieldLabel>First Name</FieldLabel>
                <Input disabled={!editing} type="text" placeholder="John" />
              </Field>
              <Field className="md:col-span-1">
                <FieldLabel>Last Name</FieldLabel>
                <Input disabled={!editing} type="text" placeholder="Doe" />
              </Field>
              <Field className="md:col-span-2">
                <FieldLabel>Email</FieldLabel>
                <Input
                  disabled={!editing}
                  type="email"
                  placeholder="john.doe@example.com"
                />
              </Field>
              <Field className="md:col-span-2">
                <FieldLabel>Address</FieldLabel>
                <Input
                  disabled={!editing}
                  type="text"
                  placeholder="123 Main St"
                />
              </Field>
              <Field className="md:col-span-2">
                <Button disabled={!editing} type="submit">
                  Save
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Your Appointments</h2>
          {nextAppointment ? (
            <AppointmentCard appointment={nextAppointment} />
          ) : (
            <p className="text-sm text-muted-foreground">
              No appointments yet.
            </p>
          )}
          <Button asChild variant="ghost" className="w-full">
            <Link to="/profile/appointments">All Appointments</Link>
          </Button>
        </div>
      </section>
    </main>
  );
};
