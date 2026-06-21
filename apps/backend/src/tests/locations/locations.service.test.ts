import { describe, expect, test, afterAll } from 'bun:test';
import { locationsService } from '../../api/locations/locations.service';
import { db, locations, like, eq } from '@repo/db';

const assertDefined = <T>(val: T | undefined): T => {
  expect(val).toBeDefined();
  return val as T;
};

afterAll(async () => {
  await db.delete(locations).where(like(locations.location_address, 'TEST_%'));
});

describe('locationsService.list', () => {
  test('should return an array', async () => {
    const result = await locationsService.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe('locationsService.getById', () => {
  test('should return a location when valid ID exists', async () => {
    const created = assertDefined(
      await locationsService.create({
        location_address: 'TEST_GetById',
        location_city: 'Copenhagen',
      }),
    );
    const found = await locationsService.getById(created.location_pk);
    expect(found).toBeDefined();
    expect(found!.location_pk).toBe(created.location_pk);
  });

  test('should return undefined when ID does not exist', async () => {
    const result = await locationsService.getById(
      '00000000-0000-0000-0000-000000000000',
    );
    expect(result).toBeUndefined();
  });
});

describe('locationsService.create', () => {
  test('should create and return the new location', async () => {
    const location = assertDefined(
      await locationsService.create({
        location_address: 'TEST_Create',
        location_city: 'Copenhagen',
      }),
    );
    expect(location.location_address).toBe('TEST_Create');
    expect(location.location_city).toBe('Copenhagen');
  });

  test('should generate a valid UUID for location_pk', async () => {
    const location = assertDefined(
      await locationsService.create({
        location_address: 'TEST_CreateUUID',
        location_city: 'Copenhagen',
      }),
    );
    expect(location.location_pk).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  test('should set location_created_at automatically', async () => {
    const location = assertDefined(
      await locationsService.create({
        location_address: 'TEST_CreateTimestamp',
        location_city: 'Copenhagen',
      }),
    );
    const row = assertDefined(
      (
        await db
          .select()
          .from(locations)
          .where(eq(locations.location_pk, location.location_pk))
      )[0],
    );
    expect(row.location_created_at).toBeInstanceOf(Date);
  });

  test('should accept optional fields', async () => {
    const location = assertDefined(
      await locationsService.create({
        location_address: 'TEST_CreateFull',
        location_city: 'Copenhagen',
        location_postal_code: '2200',
        location_country: 'Denmark',
        location_latitude: '64.135338',
        location_longitude: '-21.895210',
      }),
    );
    expect(location.location_postal_code).toBe('2200');
    expect(location.location_country).toBe('Denmark');
    expect(location).not.toHaveProperty('location_latitude');
    expect(location).not.toHaveProperty('location_longitude');
    const row = assertDefined(
      (
        await db
          .select()
          .from(locations)
          .where(eq(locations.location_pk, location.location_pk))
      )[0],
    );
    expect(row.location_latitude).toBe('64.135338');
    expect(row.location_longitude).toBe('-21.895210');
  });
});
