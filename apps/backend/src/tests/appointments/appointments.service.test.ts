import { describe, it, expect, afterAll, beforeAll } from 'bun:test';
import { appointmentsService } from '../../api/appointments/appointments.service';
import { authService } from '../../api/auth/auth.service';
import { db, users, services, like, eq } from '@repo/db';

const TEST_SERVICE_PK = '33333333-3333-4333-8333-333333333333';

const testAppointmentIds: string[] = [];
let testUserId = '';

const assertDefined = <T>(val: T | undefined | null): T => {
  expect(val).not.toBeNull();
  expect(val).toBeDefined();
  return val as T;
};

beforeAll(async () => {
  await db.delete(users).where(like(users.user_email, 'TEST_%'));

  await db
    .insert(services)
    .values({
      service_pk: TEST_SERVICE_PK,
      service_title: 'TEST Appointment Service Svc',
      service_duration: 30,
      service_price: '50.00',
    })
    .onConflictDoNothing();

  const result = assertDefined(
    await authService.signup({
      first_name: 'TEST',
      last_name: 'AppointmentSvc',
      email: 'TEST_appt_service@example.com',
      password: 'password123',
      address: 'TEST Address 1',
      postal_code: '1234',
      city: 'Copenhagen',
    }),
  );
  testUserId = result.user.user_pk;
});

afterAll(async () => {
  for (const id of testAppointmentIds) {
    await appointmentsService.delete(id).catch(() => undefined);
  }
  await db.delete(users).where(like(users.user_email, 'TEST_%'));
  await db.delete(services).where(eq(services.service_pk, TEST_SERVICE_PK));
});

const makeInput = (userId: string) => ({
  appointment_user_fk: userId,
  location_fk: null,
  appointment_time: '10:00',
  appointment_date: '2030-06-15',
  appointment_notes: null,
  appointment_duration: 30,
  appointment_total_price: '50.00',
  services: [
    { service_fk: '33333333-3333-4333-8333-333333333333', quantity: 1 },
  ],
});

describe('appointmentsService.list', () => {
  it('should return an array', async () => {
    const result = await appointmentsService.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should not include soft-deleted appointments', async () => {
    const created = assertDefined(
      await appointmentsService.post(makeInput(testUserId)),
    );
    testAppointmentIds.push(created.appointment_pk);
    await appointmentsService.delete(created.appointment_pk);

    const result = await appointmentsService.list();
    const found = result.find(
      (a) => a.appointment_pk === created.appointment_pk,
    );
    expect(found).toBeUndefined();
  });
});

describe('appointmentsService.get', () => {
  it('should return an appointment when valid ID exists', async () => {
    const created = assertDefined(
      await appointmentsService.post(makeInput(testUserId)),
    );
    testAppointmentIds.push(created.appointment_pk);

    const found = assertDefined(
      await appointmentsService.get(created.appointment_pk),
    );
    expect(found.appointment_pk).toBe(created.appointment_pk);
  });

  it('should return undefined when ID does not exist', async () => {
    const result = await appointmentsService.get(
      '00000000-0000-0000-0000-000000000000',
    );
    expect(result).toBeUndefined();
  });

  it('should not return a soft-deleted appointment', async () => {
    const created = assertDefined(
      await appointmentsService.post(makeInput(testUserId)),
    );
    testAppointmentIds.push(created.appointment_pk);
    await appointmentsService.delete(created.appointment_pk);

    const result = await appointmentsService.get(created.appointment_pk);
    expect(result).toBeUndefined();
  });
});

describe('appointmentsService.post', () => {
  it('should create and return the new appointment', async () => {
    const input = makeInput(testUserId);
    const result = assertDefined(await appointmentsService.post(input));
    testAppointmentIds.push(result.appointment_pk);

    expect(result.appointment_user_fk).toBe(testUserId);
    expect(result.appointment_date).toBe('2030-06-15');
    expect(result.appointment_status).toBe('pending');
  });

  it('should generate a valid UUID for appointment_pk', async () => {
    const result = assertDefined(
      await appointmentsService.post(makeInput(testUserId)),
    );
    testAppointmentIds.push(result.appointment_pk);

    expect(result.appointment_pk).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it('should default appointment_status to pending', async () => {
    const result = assertDefined(
      await appointmentsService.post(makeInput(testUserId)),
    );
    testAppointmentIds.push(result.appointment_pk);

    expect(result.appointment_status).toBe('pending');
  });

  it('should have appointment_deleted_at as null on creation', async () => {
    const result = assertDefined(
      await appointmentsService.post(makeInput(testUserId)),
    );
    testAppointmentIds.push(result.appointment_pk);

    expect(result.appointment_deleted_at).toBeNull();
  });

  it('should store appointment_notes when provided', async () => {
    const result = assertDefined(
      await appointmentsService.post({
        ...makeInput(testUserId),
        appointment_notes: 'Please be on time',
      }),
    );
    testAppointmentIds.push(result.appointment_pk);

    expect(result.appointment_notes).toBe('Please be on time');
  });
});

describe('appointmentsService.patch', () => {
  it('should update and return the modified appointment', async () => {
    const created = assertDefined(
      await appointmentsService.post(makeInput(testUserId)),
    );
    testAppointmentIds.push(created.appointment_pk);

    const updated = assertDefined(
      await appointmentsService.patch(created.appointment_pk, {
        appointment_notes: 'Updated note',
      }),
    );

    expect(updated.appointment_notes).toBe('Updated note');
  });

  it('should leave unchanged fields the same', async () => {
    const created = assertDefined(
      await appointmentsService.post(makeInput(testUserId)),
    );
    testAppointmentIds.push(created.appointment_pk);

    const updated = assertDefined(
      await appointmentsService.patch(created.appointment_pk, {
        appointment_notes: 'Only notes changed',
      }),
    );

    expect(updated.appointment_date).toBe('2030-06-15');
    expect(updated.appointment_time).toMatch(/^10:00/);
    expect(updated.appointment_duration).toBe(30);
  });

  it('should return undefined for non-existent ID', async () => {
    const result = await appointmentsService.patch(
      '00000000-0000-0000-0000-000000000000',
      { appointment_notes: 'Nope' },
    );
    expect(result).toBeUndefined();
  });

  it('should not update a soft-deleted appointment', async () => {
    const created = assertDefined(
      await appointmentsService.post(makeInput(testUserId)),
    );
    testAppointmentIds.push(created.appointment_pk);
    await appointmentsService.delete(created.appointment_pk);

    const result = await appointmentsService.patch(created.appointment_pk, {
      appointment_notes: 'Should not work',
    });
    expect(result).toBeUndefined();
  });
});

describe('appointmentsService.listByUserId', () => {
  it('should return appointments with linked services from appointment_services', async () => {
    const created = assertDefined(
      await appointmentsService.post(makeInput(testUserId)),
    );
    testAppointmentIds.push(created.appointment_pk);

    const result = await appointmentsService.listByUserId(testUserId);
    const found = assertDefined(
      result.find((a) => a.appointment_pk === created.appointment_pk),
    );

    expect(found.services).toHaveLength(1);
    expect(found.services[0]?.service_fk).toBe(TEST_SERVICE_PK);
    expect(found.services[0]?.quantity).toBe(1);
    expect(found.services[0]?.service_title.length).toBeGreaterThan(0);
    expect(found.services[0]?.service_price).toMatch(/^\d+\.\d{2}$/);
    expect(found.location).toBeNull();
  });

  it('should return appointments ordered by date and time descending', async () => {
    const earlier = assertDefined(
      await appointmentsService.post({
        ...makeInput(testUserId),
        appointment_date: '2030-01-01',
        appointment_time: '09:00',
      }),
    );
    testAppointmentIds.push(earlier.appointment_pk);

    const laterSameDay = assertDefined(
      await appointmentsService.post({
        ...makeInput(testUserId),
        appointment_date: '2030-06-15',
        appointment_time: '14:00',
      }),
    );
    testAppointmentIds.push(laterSameDay.appointment_pk);

    const latest = assertDefined(
      await appointmentsService.post({
        ...makeInput(testUserId),
        appointment_date: '2030-12-31',
        appointment_time: '10:00',
      }),
    );
    testAppointmentIds.push(latest.appointment_pk);

    const result = await appointmentsService.listByUserId(testUserId);
    const ids = result.map((a) => a.appointment_pk);

    expect(ids.indexOf(latest.appointment_pk)).toBeLessThan(
      ids.indexOf(laterSameDay.appointment_pk),
    );
    expect(ids.indexOf(laterSameDay.appointment_pk)).toBeLessThan(
      ids.indexOf(earlier.appointment_pk),
    );
  });

  it('should return joined location when appointment has location_fk', async () => {
    const created = assertDefined(
      await appointmentsService.post({
        ...makeInput(testUserId),
        location_fk: '11111111-1111-4111-8111-111111111111',
      }),
    );
    testAppointmentIds.push(created.appointment_pk);

    const result = await appointmentsService.listByUserId(testUserId);
    const found = assertDefined(
      result.find((a) => a.appointment_pk === created.appointment_pk),
    );

    expect(found.location).not.toBeNull();
    expect(found.location?.location_pk).toBe(
      '11111111-1111-4111-8111-111111111111',
    );
    expect(found.location?.location_address.length).toBeGreaterThan(0);
    expect(found.location?.location_city.length).toBeGreaterThan(0);
  });
});

describe('appointmentsService.delete', () => {
  it('should soft-delete and return the appointment', async () => {
    const created = assertDefined(
      await appointmentsService.post(makeInput(testUserId)),
    );
    testAppointmentIds.push(created.appointment_pk);

    const deleted = assertDefined(
      await appointmentsService.delete(created.appointment_pk),
    );

    expect(deleted.appointment_deleted_at).not.toBeNull();
  });

  it('should hide the appointment from list() after deletion', async () => {
    const created = assertDefined(
      await appointmentsService.post(makeInput(testUserId)),
    );
    testAppointmentIds.push(created.appointment_pk);
    await appointmentsService.delete(created.appointment_pk);

    const list = await appointmentsService.list();
    const found = list.find((a) => a.appointment_pk === created.appointment_pk);
    expect(found).toBeUndefined();
  });

  it('should return undefined for an already-deleted appointment', async () => {
    const created = assertDefined(
      await appointmentsService.post(makeInput(testUserId)),
    );
    testAppointmentIds.push(created.appointment_pk);
    await appointmentsService.delete(created.appointment_pk);

    const result = await appointmentsService.delete(created.appointment_pk);
    expect(result).toBeUndefined();
  });

  it('should return undefined for non-existent ID', async () => {
    const result = await appointmentsService.delete(
      '00000000-0000-0000-0000-000000000000',
    );
    expect(result).toBeUndefined();
  });
});
