import { describe, it, expect, afterAll, beforeAll } from 'bun:test';
import { sign } from 'hono/jwt';
import { app } from '../../app';
import { env } from '../../lib/env';
import { availabilityService } from '../../api/availability/availability.service';
import { db, availability, eq } from '@repo/db';
import type { Availability } from '@repo/shared';

type AvailabilityResponse = { data: Availability };
type AvailabilityListResponse = { data: Availability[] };

const testIds: string[] = [];
let adminToken: string;

const assertDefined = <T>(val: T | undefined | null): T => {
  expect(val).not.toBeNull();
  expect(val).toBeDefined();
  return val as T;
};

beforeAll(async () => {
  adminToken = await sign(
    {
      user_pk: 'a0000000-0000-4000-8000-000000000001',
      user_role: 'admin',
      user_email: 'TEST_admin@example.com',
      exp: Math.floor(Date.now() / 1000) + 3600,
    },
    env.JWT_SECRET,
    'HS256',
  );
});

afterAll(async () => {
  for (const id of testIds) {
    await db
      .delete(availability)
      .where(eq(availability.availability_pk, id))
      .catch(() => undefined);
  }
});

const validInput = {
  availability_date: '2030-09-10',
  availability_start_time: '08:00',
  availability_end_time: '16:00',
  availability_type: 'available',
};

describe('GET /api/availability', () => {
  it('should return 200', async () => {
    const res = await app.request('/api/availability', { method: 'GET' });
    expect(res.status).toBe(200);
  });

  it('should return a data array', async () => {
    const res = await app.request('/api/availability', { method: 'GET' });
    const body = (await res.json()) as AvailabilityListResponse;
    expect(Array.isArray(body.data)).toBe(true);
  });
});

describe('GET /api/availability/:id', () => {
  it('should return 200 with a valid availability', async () => {
    const created = assertDefined(await availabilityService.post(validInput));
    testIds.push(created.availability_pk);

    const res = await app.request(
      `/api/availability/${created.availability_pk}`,
      { method: 'GET' },
    );
    const body = (await res.json()) as AvailabilityResponse;

    expect(res.status).toBe(200);
    expect(body.data.availability_pk).toBe(created.availability_pk);
  });

  it('should return 404 for non-existent ID', async () => {
    const res = await app.request(
      '/api/availability/00000000-0000-0000-0000-000000000000',
      { method: 'GET' },
    );
    expect(res.status).toBe(404);
  });

  it('should return 400 for invalid UUID format', async () => {
    const res = await app.request('/api/availability/not-a-uuid', {
      method: 'GET',
    });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/availability', () => {
  it('should return 201 with valid input', async () => {
    const res = await app.request('/api/availability', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(validInput),
    });
    const body = (await res.json()) as AvailabilityResponse;
    testIds.push(body.data.availability_pk);

    expect(res.status).toBe(201);
    expect(body.data.availability_date).toBe('2030-09-10');
  });

  it('should return 401 without auth token', async () => {
    const res = await app.request('/api/availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validInput),
    });
    expect(res.status).toBe(401);
  });

  it('should return 400 with missing required fields', async () => {
    const res = await app.request('/api/availability', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        availability_date: '2030-09-10',
      }),
    });
    expect(res.status).toBe(400);
  });

  it('should return 400 when start time is after end time', async () => {
    const res = await app.request('/api/availability', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        ...validInput,
        availability_start_time: '17:00',
        availability_end_time: '08:00',
      }),
    });
    expect(res.status).toBe(400);
  });

  it('should return 400 with invalid date format', async () => {
    const res = await app.request('/api/availability', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        ...validInput,
        availability_date: 'not-a-date',
      }),
    });
    expect(res.status).toBe(400);
  });
});

describe('PATCH /api/availability/:id', () => {
  it('should return 200 with a partial update', async () => {
    const created = assertDefined(await availabilityService.post(validInput));
    testIds.push(created.availability_pk);

    const res = await app.request(
      `/api/availability/${created.availability_pk}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ availability_type: 'blocked' }),
      },
    );
    const body = (await res.json()) as AvailabilityResponse;

    expect(res.status).toBe(200);
    expect(body.data.availability_type).toBe('blocked');
  });

  it('should return 401 without auth token', async () => {
    const created = assertDefined(await availabilityService.post(validInput));
    testIds.push(created.availability_pk);

    const res = await app.request(
      `/api/availability/${created.availability_pk}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability_type: 'blocked' }),
      },
    );
    expect(res.status).toBe(401);
  });

  it('should return 404 for non-existent ID', async () => {
    const res = await app.request(
      '/api/availability/00000000-0000-0000-0000-000000000000',
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ availability_type: 'blocked' }),
      },
    );
    expect(res.status).toBe(404);
  });

  it('should return 400 when start time is after end time', async () => {
    const created = assertDefined(await availabilityService.post(validInput));
    testIds.push(created.availability_pk);

    const res = await app.request(
      `/api/availability/${created.availability_pk}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          availability_start_time: '18:00',
          availability_end_time: '08:00',
        }),
      },
    );
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/availability/:id', () => {
  it('should return 200 on successful soft-delete', async () => {
    const created = assertDefined(await availabilityService.post(validInput));
    testIds.push(created.availability_pk);

    const res = await app.request(
      `/api/availability/${created.availability_pk}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      },
    );
    expect(res.status).toBe(200);
  });

  it('should hide the record from GET list after deletion', async () => {
    const created = assertDefined(await availabilityService.post(validInput));
    testIds.push(created.availability_pk);

    await app.request(`/api/availability/${created.availability_pk}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const listRes = await app.request('/api/availability', { method: 'GET' });
    const listBody = (await listRes.json()) as AvailabilityListResponse;
    const found = listBody.data.find(
      (a) => a.availability_pk === created.availability_pk,
    );
    expect(found).toBeUndefined();
  });

  it('should return 401 without auth token', async () => {
    const created = assertDefined(await availabilityService.post(validInput));
    testIds.push(created.availability_pk);

    const res = await app.request(
      `/api/availability/${created.availability_pk}`,
      { method: 'DELETE' },
    );
    expect(res.status).toBe(401);
  });

  it('should return 404 for non-existent ID', async () => {
    const res = await app.request(
      '/api/availability/00000000-0000-0000-0000-000000000000',
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      },
    );
    expect(res.status).toBe(404);
  });

  it('should return 400 for invalid UUID format', async () => {
    const res = await app.request('/api/availability/not-a-uuid', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status).toBe(400);
  });
});
