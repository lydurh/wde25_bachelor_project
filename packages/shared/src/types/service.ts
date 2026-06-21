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

/** Public API shape — internal fields stripped. */
export type PublicService = {
  service_pk: string;
  service_title: string;
  service_description: string | null;
  service_duration: number;
  service_price: string;
};

/** Strip internal fields from a service row before returning to the client. */
export function toPublicService(row: Service): PublicService {
  return {
    service_pk: row.service_pk,
    service_title: row.service_title,
    service_description: row.service_description,
    service_duration: row.service_duration,
    service_price: row.service_price,
  };
}
