import { describe, expect, test, afterAll } from 'bun:test';
import { app } from '../../app';
import { db, locations } from '@repo/db';
import { like } from 'drizzle-orm';
import type { Location } from '@repo/shared';

const assertDefined = <T>(val: T | undefined): T => {
  expect(val).toBeDefined();
  return val as T;
};

afterAll(async () => {
  await db.delete(locations).where(like(locations.location_address, 'TEST_%'));
});

describe('GET /api/locations', () => {
  test('should return 200 with an array', async () => {
    const res = await app.request('/api/locations');
    expect(res.status).toBe(200);
    const json = (await res.json()) as { data: Location[] };
    expect(Array.isArray(json.data)).toBe(true);
  });
});

describe('GET /api/locations/:locationId', () => {
  test('should return 200 for existing location', async () => {
    const createRes = await app.request('/api/locations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location_address: 'TEST_HandlerGetById',
        location_city: 'Copenhagen',
      }),
    });
    const created = (await createRes.json()) as { data: Location };
    const location = assertDefined(created.data);

    const res = await app.request(`/api/locations/${location.location_pk}`);
    expect(res.status).toBe(200);
    const json = (await res.json()) as { data: Location };
    expect(json.data.location_pk).toBe(location.location_pk);
  });

  test('should return 400 for invalid UUID', async () => {
    const res = await app.request('/api/locations/not-a-uuid');
    expect(res.status).toBe(400);
  });

  test('should return 404 for non-existent location', async () => {
    const res = await app.request(
      '/api/locations/00000000-0000-0000-0000-000000000000',
    );
    expect(res.status).toBe(404);
  });
});

describe('POST /api/locations', () => {
  test('should return 201 with valid body', async () => {
    const res = await app.request('/api/locations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location_address: 'TEST_HandlerCreate',
        location_city: 'Copenhagen',
      }),
    });
    expect(res.status).toBe(201);
    const json = (await res.json()) as { data: Location };
    expect(json.data.location_address).toBe('TEST_HandlerCreate');
  });

  test('should return 400 for invalid body', async () => {
    const res = await app.request('/api/locations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });

  test('should return 400 for missing required city', async () => {
    const res = await app.request('/api/locations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location_address: 'TEST_HandlerNoCity',
      }),
    });
    expect(res.status).toBe(400);
  });
});
