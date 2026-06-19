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

/** Public API shape — internal soft-delete marker stripped. */
export type PublicService = Omit<Service, 'service_deleted_at'>;

/** Strip internal fields from a service row before returning to the client. */
export function toPublicService(row: Service): PublicService {
  const { service_deleted_at: _service_deleted_at, ...rest } = row;
  return rest;
}
