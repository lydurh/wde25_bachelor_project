import {
  type Availability,
  type CreateAvailabilityInput,
  parseAvailability,
  type UpdateAvailabilityInput,
} from '@repo/shared';

const samples: Availability[] = [
  {
    availability_pk: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    availability_date: '2026-01-01',
    availability_start_time: '10:00',
    availability_end_time: '11:00',
    availability_type: 'available',
    availability_created_at: '2026-01-01T09:00:00.000Z',
    availability_updated_at: null,
    availability_deleted_at: null,
  },
  {
    availability_pk: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    availability_date: '2026-01-02',
    availability_start_time: '11:00',
    availability_end_time: '12:00',
    availability_type: 'available',
    availability_created_at: '2026-01-02T09:00:00.000Z',
    availability_updated_at: null,
    availability_deleted_at: null,
  },
];

export const availabilityService = {
  list(): Promise<Availability[]> {
    return Promise.resolve(samples.map((row) => parseAvailability(row)));
  },

  get(id: string): Promise<Availability | undefined> {
    const row = samples.find((r) => r.availability_pk === id);
    return Promise.resolve(row ? parseAvailability(row) : undefined);
  },

  delete(id: string): Promise<Availability | undefined> {
    if (!id) {
      return Promise.resolve(undefined);
    }
    const index = samples.findIndex((r) => r.availability_pk === id);
    if (index === -1) {
      return Promise.resolve(undefined);
    }
    const removed = samples.splice(index, 1)[0];
    if (!removed) {
      return Promise.resolve(undefined);
    }
    return Promise.resolve(parseAvailability(removed));
  },

  post(input: CreateAvailabilityInput): Promise<Availability> {
    const row: Availability = {
      availability_pk: crypto.randomUUID(),
      availability_date: input.availability_date,
      availability_start_time: input.availability_start_time,
      availability_end_time: input.availability_end_time,
      availability_type: input.availability_type ?? 'available',
      availability_created_at: new Date().toISOString(),
      availability_updated_at: null,
      availability_deleted_at: null,
    };
    samples.push(row);
    return Promise.resolve(parseAvailability(row));
  },

  patch(
    id: string,
    input: UpdateAvailabilityInput,
  ): Promise<Availability | undefined> {
    const index = samples.findIndex((r) => r.availability_pk === id);
    if (index === -1) {
      return Promise.resolve(undefined);
    }
    const row = samples[index];
    const updatedAvailability = parseAvailability({
      ...row,
      ...input,
      availability_updated_at: new Date().toISOString(),
    });
    samples[index] = updatedAvailability;
    return Promise.resolve(updatedAvailability);
  },
};
