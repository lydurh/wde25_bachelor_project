CREATE TABLE "appointment_services" (
	"appointment_fk" integer NOT NULL,
	"service_fk" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "appointment_services_appointment_fk_service_fk_pk" PRIMARY KEY("appointment_fk","service_fk")
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"appointment_pk" serial PRIMARY KEY NOT NULL,
	"appointment_user_fk" integer NOT NULL,
	"location_fk" integer,
	"appointment_time" time NOT NULL,
	"appointment_date" date NOT NULL,
	"appointment_notes" text,
	"appointment_duration" integer,
	"appointment_total_price" numeric(10, 2),
	"appointment_status" varchar(50) DEFAULT 'pending' NOT NULL,
	"appointment_created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"appointment_updated_at" timestamp with time zone,
	"appointment_deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "availability" (
	"availability_pk" serial PRIMARY KEY NOT NULL,
	"availability_date" date NOT NULL,
	"availability_start_time" time NOT NULL,
	"availability_end_time" time NOT NULL,
	"availability_type" varchar(50) DEFAULT 'available' NOT NULL,
	"availability_created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"availability_updated_at" timestamp with time zone,
	"availability_deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"location_pk" serial PRIMARY KEY NOT NULL,
	"location_address" varchar(255) NOT NULL,
	"location_postal_code" varchar(20),
	"location_city" varchar(100) NOT NULL,
	"location_country" varchar(100),
	"location_latitude" numeric(9, 6),
	"location_longitude" numeric(9, 6),
	"location_created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"location_updated_at" timestamp with time zone,
	"location_deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "services" (
	"service_pk" serial PRIMARY KEY NOT NULL,
	"service_title" varchar(255) NOT NULL,
	"service_description" text,
	"service_duration" integer NOT NULL,
	"service_price" numeric(10, 2) NOT NULL,
	"service_created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"service_updated_at" timestamp with time zone,
	"service_deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_pk" serial PRIMARY KEY NOT NULL,
	"user_role" varchar(50) DEFAULT 'client' NOT NULL,
	"user_email" varchar(255) NOT NULL,
	"user_first_name" varchar(100) NOT NULL,
	"user_last_name" varchar(100) NOT NULL,
	"user_location_fk" integer,
	"user_password" text NOT NULL,
	"user_note" text,
	"user_created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_updated_at" timestamp with time zone,
	"user_deleted_at" timestamp with time zone,
	"user_verified_at" timestamp with time zone,
	CONSTRAINT "users_user_email_unique" UNIQUE("user_email")
);
--> statement-breakpoint
ALTER TABLE "appointment_services" ADD CONSTRAINT "appointment_services_appointment_fk_appointments_appointment_pk_fk" FOREIGN KEY ("appointment_fk") REFERENCES "public"."appointments"("appointment_pk") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_services" ADD CONSTRAINT "appointment_services_service_fk_services_service_pk_fk" FOREIGN KEY ("service_fk") REFERENCES "public"."services"("service_pk") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_appointment_user_fk_users_user_pk_fk" FOREIGN KEY ("appointment_user_fk") REFERENCES "public"."users"("user_pk") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_location_fk_locations_location_pk_fk" FOREIGN KEY ("location_fk") REFERENCES "public"."locations"("location_pk") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_user_location_fk_locations_location_pk_fk" FOREIGN KEY ("user_location_fk") REFERENCES "public"."locations"("location_pk") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_appointments_user_fk" ON "appointments" USING btree ("appointment_user_fk");