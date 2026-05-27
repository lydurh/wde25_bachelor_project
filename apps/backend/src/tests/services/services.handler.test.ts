import { describe, it, expect, afterAll, beforeAll } from 'bun:test';
import { sign } from 'hono/jwt';
import { app } from '../../app';
import { env } from '../../lib/env';
import { servicesService } from '../../api/services/services.service';
import { db, services, eq } from '@repo/db';
import type { Service } from '@repo/shared';

type ServiceResponse = { data: Service };
type ServiceListResponse = { data: Service[] };

const testIds: string[] = [];
let adminToken: string;

beforeAll(async () => {
  adminToken = await sign(
    {
      sub: 'test-admin',
      role: 'admin',
      exp: Math.floor(Date.now() / 1000) + 3600,
    },
    env.JWT_SECRET,
    'HS256',
  );
});

const assertDefined = <T>(val: T | undefined): T => {
  expect(val).toBeDefined();
  return val as T;
};

afterAll(async () => {
  for (const id of testIds) {
    await db.delete(services).where(eq(services.service_pk, id));
  }
});

const validInput = {
  service_title: 'TEST_HandlerService',
  service_description: 'Handler test service',
  service_duration: 45,
  service_price: '30.00',
};

describe('GET /api/services', () => {
  it('should return 200', async () => {
    const res = await app.request('/api/services', { method: 'GET' });
    expect(res.status).toBe(200);
  });

  it('should return a data array', async () => {
    const res = await app.request('/api/services', { method: 'GET' });
    const body = (await res.json()) as ServiceListResponse;
    expect(Array.isArray(body.data)).toBe(true);
  });
});

describe('GET /api/services/:id', () => {
  it('should return 200 with a valid service', async () => {
    const created = assertDefined(
      await servicesService.create({
        ...validInput,
        service_title: 'TEST_HandlerGet',
      }),
    );
    testIds.push(created.service_pk);

    const res = await app.request(`/api/services/${created.service_pk}`, {
      method: 'GET',
    });
    const body = (await res.json()) as ServiceResponse;

    expect(res.status).toBe(200);
    expect(body.data.service_pk).toBe(created.service_pk);
  });

  it('should return 404 for non-existent ID', async () => {
    const res = await app.request(
      '/api/services/00000000-0000-0000-0000-000000000000',
      { method: 'GET' },
    );
    expect(res.status).toBe(404);
  });

  it('should return 400 for invalid UUID format', async () => {
    const res = await app.request('/api/services/not-a-uuid', {
      method: 'GET',
    });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/services', () => {
  it('should return 201 with valid input', async () => {
    const res = await app.request('/api/services', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        ...validInput,
        service_title: 'TEST_HandlerCreate',
      }),
    });
    const body = (await res.json()) as ServiceResponse;
    testIds.push(body.data.service_pk);

    expect(res.status).toBe(201);
    expect(body.data.service_title).toBe('TEST_HandlerCreate');
  });

  it('should return 400 with missing required fields', async () => {
    const res = await app.request('/api/services', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        service_description: 'No title',
        service_duration: 30,
        service_price: '25.00',
      }),
    });
    expect(res.status).toBe(400);
  });

  it('should return 400 with invalid price format', async () => {
    const res = await app.request('/api/services', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        ...validInput,
        service_price: '30',
      }),
    });
    expect(res.status).toBe(400);
  });

  it('should return 400 with negative duration', async () => {
    const res = await app.request('/api/services', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        ...validInput,
        service_duration: -1,
      }),
    });
    expect(res.status).toBe(400);
  });
});

describe('PATCH /api/services/:id', () => {
  it('should return 200 with partial update', async () => {
    const created = assertDefined(
      await servicesService.create({
        ...validInput,
        service_title: 'TEST_HandlerPatch',
      }),
    );
    testIds.push(created.service_pk);

    const res = await app.request(`/api/services/${created.service_pk}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ service_title: 'TEST_HandlerPatched' }),
    });
    const body = (await res.json()) as ServiceResponse;

    expect(res.status).toBe(200);
    expect(body.data.service_title).toBe('TEST_HandlerPatched');
  });

  it('should return 404 for non-existent ID', async () => {
    const res = await app.request(
      '/api/services/00000000-0000-0000-0000-000000000000',
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ service_title: 'Nope' }),
      },
    );
    expect(res.status).toBe(404);
  });

  it('should return 400 with invalid data', async () => {
    const created = assertDefined(
      await servicesService.create({
        ...validInput,
        service_title: 'TEST_HandlerPatchInvalid',
      }),
    );
    testIds.push(created.service_pk);

    const res = await app.request(`/api/services/${created.service_pk}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ service_duration: -1 }),
    });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/services/:id', () => {
  it('should return 200 on successful soft-delete', async () => {
    const created = assertDefined(
      await servicesService.create({
        ...validInput,
        service_title: 'TEST_HandlerDelete',
      }),
    );
    testIds.push(created.service_pk);

    const res = await app.request(`/api/services/${created.service_pk}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status).toBe(200);
  });

  it('should hide the service from GET list after deletion', async () => {
    const created = assertDefined(
      await servicesService.create({
        ...validInput,
        service_title: 'TEST_HandlerDeleteList',
      }),
    );
    testIds.push(created.service_pk);

    await app.request(`/api/services/${created.service_pk}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const listRes = await app.request('/api/services', { method: 'GET' });
    const listBody = (await listRes.json()) as ServiceListResponse;
    const found = listBody.data.find(
      (s) => s.service_pk === created.service_pk,
    );
    expect(found).toBeUndefined();
  });

  it('should return 404 for non-existent ID', async () => {
    const res = await app.request(
      '/api/services/00000000-0000-0000-0000-000000000000',
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      },
    );
    expect(res.status).toBe(404);
  });

  it('should return 404 for already-deleted service', async () => {
    const created = assertDefined(
      await servicesService.create({
        ...validInput,
        service_title: 'TEST_HandlerDeleteTwice',
      }),
    );
    testIds.push(created.service_pk);

    await app.request(`/api/services/${created.service_pk}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const res = await app.request(`/api/services/${created.service_pk}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status).toBe(404);
  });
});
