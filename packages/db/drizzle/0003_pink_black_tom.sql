CREATE TABLE "business_settings" (
	"business_settings_pk" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"location_fee_threshold_km" integer DEFAULT 15 NOT NULL,
	"location_fee_kr" numeric(10, 2) DEFAULT '200' NOT NULL,
	"business_settings_updated_at" timestamp with time zone
);
