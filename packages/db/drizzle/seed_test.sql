-- Lightweight test data for existing Drizzle-created tables.
-- Optional: wipe app data first (keeps table definitions).
-- TRUNCATE TABLE
--   public.appointment_services,
--   public.appointments,
--   public.availability,
--   public.users,
--   public.services,
--   public.locations
-- CASCADE;

INSERT INTO public.locations (
  location_pk,
  location_address,
  location_postal_code,
  location_city,
  location_country,
  location_latitude,
  location_longitude
) VALUES (
  '11111111-1111-4111-8111-111111111111',
  'Testgata 1',
  '0001',
  'Oslo',
  'Norway',
  59.913900,
  10.752200
)
ON CONFLICT (location_pk) DO NOTHING;

INSERT INTO public.users (
  user_pk,
  user_role,
  user_email,
  user_first_name,
  user_last_name,
  user_location_fk,
  user_password
) VALUES (
  '22222222-2222-4222-8222-222222222222',
  'client',
  'dev.client@example.test',
  'Dev',
  'Client',
  '11111111-1111-4111-8111-111111111111',
  'not-a-real-hash-change-me'
)
ON CONFLICT (user_pk) DO NOTHING;

INSERT INTO public.services (
  service_pk,
  service_title,
  service_description,
  service_duration,
  service_price
) VALUES
  (
    '33333333-3333-4333-8333-333333333333',
    'Cut',
    'Quick trim',
    30,
    499.00
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'Color',
    'Full color',
    90,
    1299.00
  )
ON CONFLICT (service_pk) DO NOTHING;

INSERT INTO public.availability (
  availability_pk,
  availability_date,
  availability_start_time,
  availability_end_time,
  availability_type
) VALUES (
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  '2026-06-01',
  '09:00',
  '17:00',
  'available'
)
ON CONFLICT (availability_pk) DO NOTHING;

INSERT INTO public.appointments (
  appointment_pk,
  appointment_user_fk,
  location_fk,
  appointment_time,
  appointment_date,
  appointment_notes,
  appointment_duration,
  appointment_total_price,
  appointment_status
) VALUES (
  '44444444-4444-4444-8444-444444444444',
  '22222222-2222-4222-8222-222222222222',
  '11111111-1111-4111-8111-111111111111',
  '10:30',
  '2026-06-15',
  'Seed appointment',
  60,
  799.00,
  'pending'
)
ON CONFLICT (appointment_pk) DO NOTHING;

INSERT INTO public.appointment_services (
  appointment_fk,
  service_fk,
  quantity
) VALUES
  ('44444444-4444-4444-8444-444444444444', '33333333-3333-4333-8333-333333333333', 1),
  ('44444444-4444-4444-8444-444444444444', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 1)
ON CONFLICT (appointment_fk, service_fk) DO NOTHING;