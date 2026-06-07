INSERT INTO "locations" (
  "location_pk", "location_address", "location_postal_code",
  "location_city", "location_country", "location_latitude", "location_longitude"
) VALUES (
  '11111111-1111-4111-8111-111111111111',
  'Testgata 1', '0001', 'Oslo', 'Norway', '59.913900', '10.752200'
);
--> statement-breakpoint

INSERT INTO "users" (
  "user_pk", "user_role", "user_email", "user_first_name", "user_last_name",
  "user_password", "user_location_fk", "user_verified_at"
) VALUES
  (
    '00000000-0000-4000-8000-000000000000', 'admin', 'admin@example.test',
    'Admin', 'Frisør',
    '$argon2id$v=19$m=65536,t=2,p=1$fi4L0qUON3jOLMSmd5fbzyz00g1MVqoeJBDKnpreWuI$qqDCE8GxszcKiqY1kWPBbQRaV5eFk9MgVpsNvNQnfB4',
    '11111111-1111-4111-8111-111111111111', NOW()
  ),
  (
    '22222222-2222-4222-8222-222222222222', 'client', 'dev.client@example.test',
    'Dev', 'Client',
    '$argon2id$v=19$m=65536,t=2,p=1$fi4L0qUON3jOLMSmd5fbzyz00g1MVqoeJBDKnpreWuI$qqDCE8GxszcKiqY1kWPBbQRaV5eFk9MgVpsNvNQnfB4',
    '11111111-1111-4111-8111-111111111111', NOW()
  );
--> statement-breakpoint

INSERT INTO "services" (
  "service_pk", "service_title", "service_description", "service_duration", "service_price"
) VALUES
  ('33333333-3333-4333-8333-333333333333', 'Cut',   'Quick trim',  30,  '499.00'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Color', 'Full color',  90, '1299.00');
--> statement-breakpoint

INSERT INTO "availability" (
  "availability_date", "availability_start_time", "availability_end_time", "availability_type"
)
SELECT
  d::date,
  '09:00'::time,
  '17:00'::time,
  'available'
FROM generate_series('2026-06-01'::date, '2026-06-30'::date, '1 day') AS d
WHERE EXTRACT(ISODOW FROM d) < 6;
--> statement-breakpoint

INSERT INTO "appointments" (
  "appointment_pk", "appointment_user_fk", "location_fk",
  "appointment_time", "appointment_date", "appointment_notes",
  "appointment_duration", "appointment_total_price", "appointment_status"
) VALUES (
  '44444444-4444-4444-8444-444444444444',
  '22222222-2222-4222-8222-222222222222',
  '11111111-1111-4111-8111-111111111111',
  '10:30', '2026-06-15', 'Seed appointment', 60, '799.00', 'confirmed'
);
--> statement-breakpoint

INSERT INTO "appointment_services" ("appointment_fk", "service_fk", "quantity") VALUES
  ('44444444-4444-4444-8444-444444444444', '33333333-3333-4333-8333-333333333333', 1),
  ('44444444-4444-4444-8444-444444444444', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 1);
