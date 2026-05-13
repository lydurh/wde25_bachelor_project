export type Service = {
  service_pk: string;
  service_title: string;
  service_description: string | null;
  service_duration: number;
  service_price: string;
  service_created_at: Date;
  service_updated_at: Date | null;
  service_deleted_at: Date | null;
};
