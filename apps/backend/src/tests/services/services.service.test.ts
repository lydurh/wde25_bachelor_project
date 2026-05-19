import { describe, it, expect, afterAll } from 'bun:test';
import { servicesService } from '../../api/services/services.service';

const testIds: string[] = [];

const assertDefined = <T>(val: T | undefined): T => {
  expect(val).toBeDefined();
  return val as T;
};

afterAll(async () => {
  for (const id of testIds) {
    await servicesService.remove(id);
  }
});

const validInput = {
  service_title: 'TEST_Haircut',
  service_description: 'A basic haircut',
  service_duration: 30,
  service_price: '25.00',
};

describe('servicesService.list', () => {
  it('should return an array', async () => {
    const result = await servicesService.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should not include soft-deleted services', async () => {
    const created = assertDefined(
      await servicesService.create({
        ...validInput,
        service_title: 'TEST_SoftDeleteList',
      }),
    );
    testIds.push(created.service_pk);
    await servicesService.remove(created.service_pk);

    const result = await servicesService.list();
    const found = result.find((s) => s.service_pk === created.service_pk);
    expect(found).toBeUndefined();
  });
});

describe('servicesService.getById', () => {
  it('should return a service when valid ID exists', async () => {
    const created = assertDefined(
      await servicesService.create({
        ...validInput,
        service_title: 'TEST_GetById',
      }),
    );
    testIds.push(created.service_pk);

    const result = assertDefined(
      await servicesService.getById(created.service_pk),
    );
    expect(result.service_pk).toBe(created.service_pk);
    expect(result.service_title).toBe('TEST_GetById');
  });

  it('should return undefined when ID does not exist', async () => {
    const result = await servicesService.getById(
      '00000000-0000-0000-0000-000000000000',
    );
    expect(result).toBeUndefined();
  });

  it('should not return a soft-deleted service', async () => {
    const created = assertDefined(
      await servicesService.create({
        ...validInput,
        service_title: 'TEST_GetByIdDeleted',
      }),
    );
    testIds.push(created.service_pk);
    await servicesService.remove(created.service_pk);

    const result = await servicesService.getById(created.service_pk);
    expect(result).toBeUndefined();
  });
});

describe('servicesService.create', () => {
  it('should create and return the new service', async () => {
    const result = assertDefined(
      await servicesService.create({
        ...validInput,
        service_title: 'TEST_Create',
      }),
    );
    testIds.push(result.service_pk);

    expect(result.service_title).toBe('TEST_Create');
    expect(result.service_description).toBe('A basic haircut');
    expect(result.service_duration).toBe(30);
    expect(result.service_price).toBe('25.00');
  });

  it('should generate a valid UUID for service_pk', async () => {
    const result = assertDefined(
      await servicesService.create({
        ...validInput,
        service_title: 'TEST_CreateUUID',
      }),
    );
    testIds.push(result.service_pk);

    expect(result.service_pk).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it('should set service_created_at automatically', async () => {
    const result = assertDefined(
      await servicesService.create({
        ...validInput,
        service_title: 'TEST_CreateTimestamp',
      }),
    );
    testIds.push(result.service_pk);

    expect(result.service_created_at).toBeInstanceOf(Date);
  });

  it('should have service_deleted_at as null on creation', async () => {
    const result = assertDefined(
      await servicesService.create({
        ...validInput,
        service_title: 'TEST_CreateNoDelete',
      }),
    );
    testIds.push(result.service_pk);

    expect(result.service_deleted_at).toBeNull();
  });
});

describe('servicesService.update', () => {
  it('should update and return the modified service', async () => {
    const created = assertDefined(
      await servicesService.create({
        ...validInput,
        service_title: 'TEST_Update',
      }),
    );
    testIds.push(created.service_pk);

    const result = assertDefined(
      await servicesService.update(created.service_pk, {
        service_title: 'TEST_Updated',
      }),
    );

    expect(result.service_title).toBe('TEST_Updated');
  });

  it('should set service_updated_at after update', async () => {
    const created = assertDefined(
      await servicesService.create({
        ...validInput,
        service_title: 'TEST_UpdateTimestamp',
      }),
    );
    testIds.push(created.service_pk);

    const result = assertDefined(
      await servicesService.update(created.service_pk, {
        service_title: 'TEST_UpdatedTimestamp',
      }),
    );

    expect(result.service_updated_at).toBeInstanceOf(Date);
  });

  it('should leave unchanged fields the same', async () => {
    const created = assertDefined(
      await servicesService.create({
        ...validInput,
        service_title: 'TEST_UpdatePartial',
      }),
    );
    testIds.push(created.service_pk);

    const result = assertDefined(
      await servicesService.update(created.service_pk, {
        service_title: 'TEST_UpdatedPartial',
      }),
    );

    expect(result.service_duration).toBe(30);
    expect(result.service_price).toBe('25.00');
  });

  it('should return undefined for non-existent ID', async () => {
    const result = await servicesService.update(
      '00000000-0000-0000-0000-000000000000',
      { service_title: 'Nope' },
    );
    expect(result).toBeUndefined();
  });

  it('should not update a soft-deleted service', async () => {
    const created = assertDefined(
      await servicesService.create({
        ...validInput,
        service_title: 'TEST_UpdateDeleted',
      }),
    );
    testIds.push(created.service_pk);
    await servicesService.remove(created.service_pk);

    const result = await servicesService.update(created.service_pk, {
      service_title: 'TEST_ShouldNotWork',
    });
    expect(result).toBeUndefined();
  });
});

describe('servicesService.remove', () => {
  it('should soft-delete and return the service', async () => {
    const created = assertDefined(
      await servicesService.create({
        ...validInput,
        service_title: 'TEST_Remove',
      }),
    );
    testIds.push(created.service_pk);

    const result = assertDefined(
      await servicesService.remove(created.service_pk),
    );
    expect(result.service_deleted_at).toBeInstanceOf(Date);
  });

  it('should hide the service from list() after removal', async () => {
    const created = assertDefined(
      await servicesService.create({
        ...validInput,
        service_title: 'TEST_RemoveList',
      }),
    );
    testIds.push(created.service_pk);
    await servicesService.remove(created.service_pk);

    const list = await servicesService.list();
    const found = list.find((s) => s.service_pk === created.service_pk);
    expect(found).toBeUndefined();
  });

  it('should return undefined for non-existent ID', async () => {
    const result = await servicesService.remove(
      '00000000-0000-0000-0000-000000000000',
    );
    expect(result).toBeUndefined();
  });

  it('should not soft-delete an already deleted service', async () => {
    const created = assertDefined(
      await servicesService.create({
        ...validInput,
        service_title: 'TEST_RemoveTwice',
      }),
    );
    testIds.push(created.service_pk);
    await servicesService.remove(created.service_pk);

    const result = await servicesService.remove(created.service_pk);
    expect(result).toBeUndefined();
  });
});
