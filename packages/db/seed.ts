import { db } from './src/client';
import {
  locations,
  users,
  services,
  appointments,
  appointmentServices,
  availability,
} from './src/schema';
import { sql } from 'drizzle-orm';

const seed = async () => {
  // Clean existing data
  await db.execute(sql`TRUNCATE TABLE
    public.appointment_services,
    public.appointments,
    public.availability,
    public.users,
    public.services,
    public.locations
  CASCADE`);

  // Location
  const [location] = await db
    .insert(locations)
    .values({
      location_pk: '11111111-1111-4111-8111-111111111111',
      location_address: 'Testgata 1',
      location_postal_code: '0001',
      location_city: 'Oslo',
      location_country: 'Norway',
      location_latitude: '59.913900',
      location_longitude: '10.752200',
    })
    .returning();

  if (!location) throw new Error('Failed to create location');

  const passwordHash = await Bun.password.hash('password123');

  // Admin user (hairdresser) — linked to the location
  await db.insert(users).values({
    user_pk: '00000000-0000-4000-8000-000000000000',
    user_role: 'admin',
    user_email: 'admin@example.test',
    user_first_name: 'Admin',
    user_last_name: 'Frisør',
    user_password: passwordHash,
    user_location_fk: location.location_pk,
    user_verified_at: new Date(),
  });

  // Client user
  await db.insert(users).values({
    user_pk: '22222222-2222-4222-8222-222222222222',
    user_role: 'client',
    user_email: 'dev.client@example.test',
    user_first_name: 'Dev',
    user_last_name: 'Client',
    user_password: passwordHash,
    user_location_fk: location.location_pk,
    user_verified_at: new Date(),
  });

  // Services
  await db.insert(services).values([
    {
      service_pk: '33333333-3333-4333-8333-333333333333',
      service_title: 'Cut',
      service_description: 'Quick trim',
      service_duration: 30,
      service_price: '499.00',
    },
    {
      service_pk: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      service_title: 'Color',
      service_description: 'Full color',
      service_duration: 90,
      service_price: '1299.00',
    },
  ]);

  // Availability — June 2026, weekdays 09-17
  const availabilityRows = [];
  for (let day = 1; day <= 30; day++) {
    const date = new Date(2026, 5, day); // month is 0-indexed
    const dow = date.getDay();
    if (dow === 0 || dow === 6) continue; // skip weekends
    const dateStr = `2026-06-${String(day).padStart(2, '0')}`;
    availabilityRows.push({
      availability_date: dateStr,
      availability_start_time: '09:00',
      availability_end_time: '17:00',
      availability_type: 'available' as const,
    });
  }
  await db.insert(availability).values(availabilityRows);

  // Appointment
  await db.insert(appointments).values({
    appointment_pk: '44444444-4444-4444-8444-444444444444',
    appointment_user_fk: '22222222-2222-4222-8222-222222222222',
    location_fk: '11111111-1111-4111-8111-111111111111',
    appointment_time: '10:30',
    appointment_date: '2026-06-15',
    appointment_notes: 'Seed appointment',
    appointment_duration: 60,
    appointment_total_price: '799.00',
    appointment_status: 'pending',
  });

  // Appointment-Services join
  await db.insert(appointmentServices).values([
    {
      appointment_fk: '44444444-4444-4444-8444-444444444444',
      service_fk: '33333333-3333-4333-8333-333333333333',
      quantity: 1,
    },
    {
      appointment_fk: '44444444-4444-4444-8444-444444444444',
      service_fk: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      quantity: 1,
    },
  ]);

  console.warn(
    'Seeded: 1 location, 2 users (admin+client), 2 services, 22 availability days, 1 appointment',
  );
  process.exit(0);
};

void seed();