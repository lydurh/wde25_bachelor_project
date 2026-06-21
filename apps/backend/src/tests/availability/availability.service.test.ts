import { describe, it, expect, afterAll } from 'bun:test';
import { availabilityService } from '../../api/availability/availability.service';
import { db, availability, eq } from '@repo/db';

const testIds: string[] = [];

const assertDefined = <T>(val: T | undefined | null): T => {
  expect(val).not.toBeNull();
  expect(val).toBeDefined();
  return val as T;
};

afterAll(async () => {
  for (const id of testIds) {
    await db
      .delete(availability)
      .where(eq(availability.availability_pk, id))
      .catch(() => undefined);
  }
});

const validInput = {
  availability_date: '2030-08-01',
  availability_start_time: '09:00',
  availability_end_time: '17:00',
  availability_type: 'available' as const,
};

describe('availabilityService.list', () => {
  it('should return an array', async () => {
    const result = await availabilityService.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should not include soft-deleted records', async () => {
    const created = assertDefined(await availabilityService.post(validInput));
    testIds.push(created.availability_pk);
    await availabilityService.delete(created.availability_pk);

    const result = await availabilityService.list();
    const found = result.find(
      (a) => a.availability_pk === created.availability_pk,
    );
    expect(found).toBeUndefined();
  });
});

describe('availabilityService.get', () => {
  it('should return an availability when valid ID exists', async () => {
    const created = assertDefined(await availabilityService.post(validInput));
    testIds.push(created.availability_pk);

    const found = assertDefined(
      await availabilityService.get(created.availability_pk),
    );
    expect(found.availability_pk).toBe(created.availability_pk);
    expect(found.availability_date).toBe('2030-08-01');
  });

  it('should return undefined when ID does not exist', async () => {
    const result = await availabilityService.get(
      '00000000-0000-0000-0000-000000000000',
    );
    expect(result).toBeUndefined();
  });

  it('should not return a soft-deleted record', async () => {
    const created = assertDefined(await availabilityService.post(validInput));
    testIds.push(created.availability_pk);
    await availabilityService.delete(created.availability_pk);

    const result = await availabilityService.get(created.availability_pk);
    expect(result).toBeUndefined();
  });
});

describe('availabilityService.post', () => {
  it('should create and return the new availability', async () => {
    const result = assertDefined(await availabilityService.post(validInput));
    testIds.push(result.availability_pk);

    expect(result.availability_date).toBe('2030-08-01');
    expect(result.availability_start_time).toMatch(/^09:00/);
    expect(result.availability_end_time).toMatch(/^17:00/);
    expect(result.availability_type).toBe('available');
  });

  it('should generate a valid UUID for availability_pk', async () => {
    const result = assertDefined(await availabilityService.post(validInput));
    testIds.push(result.availability_pk);

    expect(result.availability_pk).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it('should default availability_type to available when omitted', async () => {
    const { availability_type: _type, ...inputWithoutType } = validInput;
    const result = assertDefined(
      await availabilityService.post(inputWithoutType),
    );
    testIds.push(result.availability_pk);

    expect(result.availability_type).toBe('available');
  });

  it('should not expose availability_deleted_at on creation', async () => {
    const result = assertDefined(await availabilityService.post(validInput));
    testIds.push(result.availability_pk);

    expect(result).not.toHaveProperty('availability_deleted_at');
  });
});

describe('availabilityService.patch', () => {
  it('should update and return the modified availability', async () => {
    const created = assertDefined(await availabilityService.post(validInput));
    testIds.push(created.availability_pk);

    const updated = assertDefined(
      await availabilityService.patch(created.availability_pk, {
        availability_type: 'blocked',
      }),
    );

    expect(updated.availability_type).toBe('blocked');
  });

  it('should leave unchanged fields the same', async () => {
    const created = assertDefined(await availabilityService.post(validInput));
    testIds.push(created.availability_pk);

    const updated = assertDefined(
      await availabilityService.patch(created.availability_pk, {
        availability_type: 'blocked',
      }),
    );

    expect(updated.availability_date).toBe('2030-08-01');
    expect(updated.availability_start_time).toMatch(/^09:00/);
    expect(updated.availability_end_time).toMatch(/^17:00/);
  });

  it('should set availability_updated_at after update', async () => {
    const created = assertDefined(await availabilityService.post(validInput));
    testIds.push(created.availability_pk);

    const updated = assertDefined(
      await availabilityService.patch(created.availability_pk, {
        availability_type: 'blocked',
      }),
    );

    expect(updated.availability_updated_at).not.toBeNull();
  });

  it('should return undefined for non-existent ID', async () => {
    const result = await availabilityService.patch(
      '00000000-0000-0000-0000-000000000000',
      { availability_type: 'blocked' },
    );
    expect(result).toBeUndefined();
  });

  it('should not update a soft-deleted record', async () => {
    const created = assertDefined(await availabilityService.post(validInput));
    testIds.push(created.availability_pk);
    await availabilityService.delete(created.availability_pk);

    const result = await availabilityService.patch(created.availability_pk, {
      availability_type: 'blocked',
    });
    expect(result).toBeUndefined();
  });
});

describe('availabilityService.delete', () => {
  it('should soft-delete and return the record', async () => {
    const created = assertDefined(await availabilityService.post(validInput));
    testIds.push(created.availability_pk);

    const deleted = assertDefined(
      await availabilityService.delete(created.availability_pk),
    );

    expect(deleted.availability_pk).toBe(created.availability_pk);
    expect(deleted).not.toHaveProperty('availability_deleted_at');
  });

  it('should hide the record from list() after deletion', async () => {
    const created = assertDefined(await availabilityService.post(validInput));
    testIds.push(created.availability_pk);
    await availabilityService.delete(created.availability_pk);

    const list = await availabilityService.list();
    const found = list.find(
      (a) => a.availability_pk === created.availability_pk,
    );
    expect(found).toBeUndefined();
  });

  it('should return undefined for an already-deleted record', async () => {
    const created = assertDefined(await availabilityService.post(validInput));
    testIds.push(created.availability_pk);
    await availabilityService.delete(created.availability_pk);

    const result = await availabilityService.delete(created.availability_pk);
    expect(result).toBeUndefined();
  });

  it('should return undefined for non-existent ID', async () => {
    const result = await availabilityService.delete(
      '00000000-0000-0000-0000-000000000000',
    );
    expect(result).toBeUndefined();
  });
});
