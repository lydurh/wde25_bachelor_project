import { db } from './src/client';
import {
  locations,
  users,
  services,
  appointments,
  appointmentServices,
} from './src/schema';

const seed = async () => {
  // Location
  const [location] = await db
    .insert(locations)
    .values({
      location_address: 'Laugavegur 42',
      location_postal_code: '0101',
      location_city: 'Reykjavík',
      location_country: 'Iceland',
    })
    .returning();

  if (!location) throw new Error('Failed to create location');

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  const clientHash = await Bun.password.hash('client123');

 

  /* eslint-disable @typescript-eslint/no-unsafe-assignment */
  const [client1] = await db
    .insert(users)
    .values({
      user_role: 'client',
      user_email: 'john@example.com',
      user_first_name: 'John',
      user_last_name: 'Doe',
      user_password: clientHash,
      user_location_fk: location.location_pk,
      user_verified_at: new Date(),
    })
    .returning();

  const [client2] = await db
    .insert(users)
    .values({
      user_role: 'client',
      user_email: 'jane@example.com',
      user_first_name: 'Jane',
      user_last_name: 'Smith',
      user_password: clientHash,
      user_verified_at: new Date(),
    })
    .returning();
  /* eslint-enable @typescript-eslint/no-unsafe-assignment */


  // Services
  const [haircut] = await db
    .insert(services)
    .values({
      service_title: 'Haircut',
      service_description: 'Classic haircut and styling',
      service_duration: 30,
      service_price: '3500.00',
    })
    .returning();

  const [coloring] = await db
    .insert(services)
    .values({
      service_title: 'Hair Coloring',
      service_description: 'Full hair coloring treatment',
      service_duration: 90,
      service_price: '12000.00',
    })
    .returning();

  const [beard] = await db
    .insert(services)
    .values({
      service_title: 'Beard Trim',
      service_description: 'Beard shaping and trimming',
      service_duration: 15,
      service_price: '2000.00',
    })
    .returning();

  if (!haircut || !coloring || !beard)
    throw new Error('Failed to create services');

  // Appointments
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const [appt1] = await db
    .insert(appointments)
    .values({
      appointment_user_fk: client1.user_pk,
      location_fk: location.location_pk,
      appointment_date: today,
      appointment_time: '10:00',
      appointment_status: 'confirmed',
      appointment_duration: 30,
      appointment_total_price: '3500.00',
      appointment_notes: 'Regular trim',
    })
    .returning();

  const [appt2] = await db
    .insert(appointments)
    .values({
      appointment_user_fk: client2.user_pk,
      location_fk: location.location_pk,
      appointment_date: today,
      appointment_time: '14:00',
      appointment_status: 'pending',
      appointment_duration: 90,
      appointment_total_price: '12000.00',
    })
    .returning();

  const [appt3] = await db
    .insert(appointments)
    .values({
      appointment_user_fk: client1.user_pk,
      location_fk: location.location_pk,
      appointment_date: tomorrow,
      appointment_time: '11:00',
      appointment_status: 'pending',
      appointment_duration: 45,
      appointment_total_price: '5500.00',
    })
    .returning();

  if (!appt1 || !appt2 || !appt3)
    throw new Error('Failed to create appointments');

  // Appointment-Services join
  await db.insert(appointmentServices).values([
    { appointment_fk: appt1.appointment_pk, service_fk: haircut.service_pk, quantity: 1 },
    { appointment_fk: appt2.appointment_pk, service_fk: coloring.service_pk, quantity: 1 },
    { appointment_fk: appt3.appointment_pk, service_fk: haircut.service_pk, quantity: 1 },
    { appointment_fk: appt3.appointment_pk, service_fk: beard.service_pk, quantity: 1 },
  ]);

  // eslint-disable-next-line no-console
  console.log('Seeded: 1 location, 3 users, 3 services, 3 appointments');
  process.exit(0);
};

void seed();
