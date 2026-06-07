-- Auto-confirm bookings: remove 'pending' from appointment_status enum.
-- Postgres cannot drop an enum value in place, so recreate the type.

UPDATE "appointments" SET "appointment_status" = 'confirmed'
  WHERE "appointment_status" = 'pending';
--> statement-breakpoint

ALTER TABLE "appointments" ALTER COLUMN "appointment_status" DROP DEFAULT;
--> statement-breakpoint

ALTER TYPE "public"."appointment_status" RENAME TO "appointment_status_old";
--> statement-breakpoint

CREATE TYPE "public"."appointment_status" AS ENUM('confirmed', 'cancelled', 'completed');
--> statement-breakpoint

ALTER TABLE "appointments"
  ALTER COLUMN "appointment_status" TYPE "public"."appointment_status"
  USING "appointment_status"::text::"public"."appointment_status";
--> statement-breakpoint

ALTER TABLE "appointments" ALTER COLUMN "appointment_status" SET DEFAULT 'confirmed';
--> statement-breakpoint

DROP TYPE "public"."appointment_status_old";
