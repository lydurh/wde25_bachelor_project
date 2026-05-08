ALTER TABLE "appointment_services" ALTER COLUMN "appointment_fk" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "appointment_services" ALTER COLUMN "service_fk" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "appointment_services" ALTER COLUMN "quantity" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "appointment_pk" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "appointment_pk" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "appointment_user_fk" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "location_fk" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "availability" ALTER COLUMN "availability_pk" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "availability" ALTER COLUMN "availability_pk" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "locations" ALTER COLUMN "location_pk" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "locations" ALTER COLUMN "location_pk" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "locations" ALTER COLUMN "location_postal_code" SET DATA TYPE char(4);--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "service_pk" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "service_pk" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "service_title" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "user_pk" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "user_pk" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "user_location_fk" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "user_password" SET DATA TYPE varchar(255);