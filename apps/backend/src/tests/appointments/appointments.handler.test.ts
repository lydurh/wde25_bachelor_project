import { describe, it, expect, afterAll, beforeAll } from 'bun:test';
import { sign } from 'hono/jwt';
import { app } from '../../app';
import { env } from '../../lib/env';
import { authService } from '../../api/auth/auth.service';
import { appointmentsService } from '../../api/appointments/appointments.service';
import { db, users, services, like, eq } from '@repo/db';
import type { Appointment } from '@repo/shared';

const TEST_SERVICE_PK = '33333333-3333-4333-8333-333333333333';

type AppointmentResponse = { data: Appointment };
type AppointmentListResponse = { data: Appointment[] };

const testAppointmentIds: string[] = [];
let userToken = '';
let testUserId = '';

const assertDefined = <T>(val: T | undefined | null): T => {
  expect(val).not.toBeNull();
  expect(val).toBeDefined();
  return val as T;
};

beforeAll(async () => {
  await db
    .insert(services)
    .values({
      service_pk: TEST_SERVICE_PK,
      service_title: 'TEST Appointment Handler Service',
      service_duration: 45,
      service_price: '75.00',
    })
    .onConflictDoNothing();

  const signupResult = assertDefined(
    await authService.signup({
      first_name: 'TEST',
      last_name: 'AppointmentHandler',
      email: 'TEST_appt_handler@example.com',
      password: 'password123',
      address: 'TEST Address 1',
      postal_code: '1234',
      city: 'Copenhagen',
    }),
  );
  testUserId = signupResult.user.user_pk;

  userToken = await sign(
    {
      user_pk: testUserId,
      user_role: 'client',
      user_email: signupResult.user.user_email,
      exp: Math.floor(Date.now() / 1000) + 3600,
    },
    env.JWT_SECRET,
    'HS256',
  );
});

afterAll(async () => {
  for (const id of testAppointmentIds) {
    await appointmentsService.delete(id).catch(() => undefined);
  }
  await db.delete(users).where(like(users.user_email, 'TEST_%'));
  await db.delete(services).where(eq(services.service_pk, TEST_SERVICE_PK));
});

const makeBody = (userId: string) => ({
  appointment_user_fk: userId,
  location_fk: null,
  appointment_time: '11:00',
  appointment_date: '2030-07-20',
  appointment_notes: null,
  appointment_duration: 45,
  appointment_total_price: '75.00',
  services: [
    { service_fk: '33333333-3333-4333-8333-333333333333', quantity: 1 },
  ],
});

describe('GET /api/appointments', () => {
  it('should return 200', async () => {
    const res = await app.request('/api/appointments', {
      method: 'GET',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    expect(res.status).toBe(200);
  });

  it('should return a data array', async () => {
    const res = await app.request('/api/appointments', {
      method: 'GET',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const body = (await res.json()) as AppointmentListResponse;
    expect(Array.isArray(body.data)).toBe(true);
  });

  it('should return 401 without auth token', async () => {
    const res = await app.request('/api/appointments', { method: 'GET' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/appointments/:id', () => {
  it('should return 200 with a valid appointment', async () => {
    const created = assertDefined(
      await appointmentsService.post(makeBody(testUserId)),
    );
    testAppointmentIds.push(created.appointment_pk);

    const res = await app.request(
      `/api/appointments/${created.appointment_pk}`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${userToken}` },
      },
    );
    const body = (await res.json()) as AppointmentResponse;

    expect(res.status).toBe(200);
    expect(body.data.appointment_pk).toBe(created.appointment_pk);
  });

  it('should return 404 for non-existent ID', async () => {
    const res = await app.request(
      '/api/appointments/00000000-0000-0000-0000-000000000000',
      { method: 'GET', headers: { Authorization: `Bearer ${userToken}` } },
    );
    expect(res.status).toBe(404);
  });

  it('should return 400 for invalid UUID format', async () => {
    const res = await app.request('/api/appointments/not-a-uuid', {
      method: 'GET',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/appointments', () => {
  it('should return 201 with valid input', async () => {
    const res = await app.request('/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify(makeBody(testUserId)),
    });
    const body = (await res.json()) as AppointmentResponse;
    testAppointmentIds.push(body.data.appointment_pk);

    expect(res.status).toBe(201);
    expect(body.data.appointment_user_fk).toBe(testUserId);
    expect(body.data.appointment_status).toBe('pending');
  });

  it('should return 400 with missing required fields', async () => {
    const res = await app.request('/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        appointment_time: '10:00',
        appointment_date: '2030-07-20',
      }),
    });
    expect(res.status).toBe(400);
  });

  it('should return 400 with invalid date format', async () => {
    const res = await app.request('/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        ...makeBody(testUserId),
        appointment_date: 'not-a-date',
      }),
    });
    expect(res.status).toBe(400);
  });

  it('should return 400 with invalid time format', async () => {
    const res = await app.request('/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        ...makeBody(testUserId),
        appointment_time: '25:00',
      }),
    });
    expect(res.status).toBe(400);
  });

  it('should return 401 without auth token', async () => {
    const res = await app.request('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(makeBody(testUserId)),
    });
    expect(res.status).toBe(401);
  });
});

describe('PATCH /api/appointments/:id', () => {
  it('should return 200 with a partial update', async () => {
    const created = assertDefined(
      await appointmentsService.post(makeBody(testUserId)),
    );
    testAppointmentIds.push(created.appointment_pk);

    const res = await app.request(
      `/api/appointments/${created.appointment_pk}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ appointment_notes: 'Updated via handler' }),
      },
    );
    const body = (await res.json()) as AppointmentResponse;

    expect(res.status).toBe(200);
    expect(body.data.appointment_notes).toBe('Updated via handler');
  });

  it('should return 404 for non-existent ID', async () => {
    const res = await app.request(
      '/api/appointments/00000000-0000-0000-0000-000000000000',
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ appointment_notes: 'Nope' }),
      },
    );
    expect(res.status).toBe(404);
  });

  it('should return 400 with invalid time format', async () => {
    const created = assertDefined(
      await appointmentsService.post(makeBody(testUserId)),
    );
    testAppointmentIds.push(created.appointment_pk);

    const res = await app.request(
      `/api/appointments/${created.appointment_pk}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ appointment_time: '99:99' }),
      },
    );
    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid UUID format', async () => {
    const res = await app.request('/api/appointments/not-a-uuid', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ appointment_notes: 'Nope' }),
    });
    expect(res.status).toBe(400);
  });

  it('should return 401 without auth token', async () => {
    const created = assertDefined(
      await appointmentsService.post(makeBody(testUserId)),
    );
    testAppointmentIds.push(created.appointment_pk);

    const res = await app.request(
      `/api/appointments/${created.appointment_pk}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointment_notes: 'Nope' }),
      },
    );
    expect(res.status).toBe(401);
  });
});

describe('DELETE /api/appointments/:id', () => {
  it('should return 200 on successful soft-delete', async () => {
    const created = assertDefined(
      await appointmentsService.post(makeBody(testUserId)),
    );
    testAppointmentIds.push(created.appointment_pk);

    const res = await app.request(
      `/api/appointments/${created.appointment_pk}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${userToken}` },
      },
    );
    expect(res.status).toBe(200);
  });

  it('should hide the appointment from GET list after deletion', async () => {
    const created = assertDefined(
      await appointmentsService.post(makeBody(testUserId)),
    );
    testAppointmentIds.push(created.appointment_pk);

    await app.request(`/api/appointments/${created.appointment_pk}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userToken}` },
    });

    const listRes = await app.request('/api/appointments', {
      method: 'GET',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const listBody = (await listRes.json()) as AppointmentListResponse;
    const found = listBody.data.find(
      (a) => a.appointment_pk === created.appointment_pk,
    );
    expect(found).toBeUndefined();
  });

  it('should return 404 for non-existent ID', async () => {
    const res = await app.request(
      '/api/appointments/00000000-0000-0000-0000-000000000000',
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${userToken}` },
      },
    );
    expect(res.status).toBe(404);
  });

  it('should return 404 for already-deleted appointment', async () => {
    const created = assertDefined(
      await appointmentsService.post(makeBody(testUserId)),
    );
    testAppointmentIds.push(created.appointment_pk);

    await app.request(`/api/appointments/${created.appointment_pk}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const res = await app.request(
      `/api/appointments/${created.appointment_pk}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${userToken}` },
      },
    );
    expect(res.status).toBe(404);
  });

  it('should return 400 for invalid UUID format', async () => {
    const res = await app.request('/api/appointments/not-a-uuid', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    expect(res.status).toBe(400);
  });

  it('should return 401 without auth token', async () => {
    const created = assertDefined(
      await appointmentsService.post(makeBody(testUserId)),
    );
    testAppointmentIds.push(created.appointment_pk);

    const res = await app.request(
      `/api/appointments/${created.appointment_pk}`,
      { method: 'DELETE' },
    );
    expect(res.status).toBe(401);
  });
});
