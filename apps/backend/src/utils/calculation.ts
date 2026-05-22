import type { Service } from '@repo/shared';

/** Sample data for local testing: `bun run src/utils/calculation.ts` */
export const sampleServices: Service[] = [
  {
    service_pk: '00000000-0000-4000-8000-000000000001',
    service_title: 'Haircut',
    service_description: 'Standard cut and style',
    service_duration: 30,
    service_price: '35.00',
    service_created_at: new Date('2026-05-01T08:00:00.000Z'),
    service_updated_at: null,
    service_deleted_at: null,
  },
  {
    service_pk: '00000000-0000-4000-8000-000000000002',
    service_title: 'Color treatment',
    service_description: 'Full color application',
    service_duration: 90,
    service_price: '120.00',
    service_created_at: new Date('2026-05-02T10:00:00.000Z'),
    service_updated_at: null,
    service_deleted_at: null,
  },
  {
    service_pk: '00000000-0000-4000-8000-000000000003',
    service_title: 'Beard trim',
    service_description: null,
    service_duration: 15,
    service_price: '18.50',
    service_created_at: new Date('2026-05-03T12:00:00.000Z'),
    service_updated_at: new Date('2026-05-10T09:00:00.000Z'),
    service_deleted_at: null,
  },
];

export const getCumulatedServiceDuration = (services: Service[]): number => {
  return services.reduce(
    (acc, service) => acc + (service.service_duration ?? 0),
    0,
  );
};

if (import.meta.main) {
  const totalMinutes = getCumulatedServiceDuration(sampleServices);
  // eslint-disable-next-line no-console -- local script entrypoint
  console.log('Services:', sampleServices.length);
  // eslint-disable-next-line no-console -- local script entrypoint
  console.log('Cumulated duration (minutes):', totalMinutes);
}
