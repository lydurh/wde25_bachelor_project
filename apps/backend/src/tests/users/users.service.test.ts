import { describe, it, expect, afterAll } from 'bun:test';
import { usersService } from '../../api/users/users.service';
import { db, users, like, eq } from '@repo/db';

const testIds: string[] = [];

const assertDefined = <T>(val: T | undefined): T => {
  expect(val).toBeDefined();
  return val as T;
};

afterAll(async () => {
  await db.delete(users).where(like(users.user_email, 'TEST_%'));
});

const validInput = {
  user_email: 'TEST_users_svc@example.com',
  user_first_name: 'TEST',
  user_last_name: 'UserSvc',
  user_password: 'hashedpassword123',
};

const uniqueEmail = (suffix: string) => `TEST_users_svc_${suffix}@example.com`;

describe('usersService.list', () => {
  it('should return an array', async () => {
    const result = await usersService.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should not include soft-deleted users', async () => {
    const created = assertDefined(
      await usersService.create({
        ...validInput,
        user_email: uniqueEmail('list_soft_del'),
      }),
    );
    testIds.push(created.user_pk);
    await usersService.remove(created.user_pk);

    const result = await usersService.list();
    const found = result.find((u) => u.user_pk === created.user_pk);
    expect(found).toBeUndefined();
  });

  it('should not expose user_password in results', async () => {
    const created = assertDefined(
      await usersService.create({
        ...validInput,
        user_email: uniqueEmail('list_nopwd'),
      }),
    );
    testIds.push(created.user_pk);

    const list = await usersService.list();
    const found = list.find((u) => u.user_pk === created.user_pk);
    expect(
      (found as unknown as Record<string, unknown>)?.['user_password'],
    ).toBeUndefined();
  });
});

describe('usersService.getById', () => {
  it('should return a user when valid ID exists', async () => {
    const created = assertDefined(
      await usersService.create({
        ...validInput,
        user_email: uniqueEmail('get_by_id'),
      }),
    );
    testIds.push(created.user_pk);

    const found = assertDefined(await usersService.getById(created.user_pk));
    expect(found.user_pk).toBe(created.user_pk);
    expect(found.user_email).toBe(uniqueEmail('get_by_id'));
  });

  it('should return undefined when ID does not exist', async () => {
    const result = await usersService.getById(
      '00000000-0000-0000-0000-000000000000',
    );
    expect(result).toBeUndefined();
  });

  it('should not return a soft-deleted user', async () => {
    const created = assertDefined(
      await usersService.create({
        ...validInput,
        user_email: uniqueEmail('get_by_id_deleted'),
      }),
    );
    testIds.push(created.user_pk);
    await usersService.remove(created.user_pk);

    const result = await usersService.getById(created.user_pk);
    expect(result).toBeUndefined();
  });
});

describe('usersService.create', () => {
  it('should create and return the new user', async () => {
    const result = assertDefined(
      await usersService.create({
        ...validInput,
        user_email: uniqueEmail('create'),
      }),
    );
    testIds.push(result.user_pk);

    expect(result.user_email).toBe(uniqueEmail('create'));
    expect(result.user_first_name).toBe('TEST');
    expect(result.user_last_name).toBe('UserSvc');
  });

  it('should generate a valid UUID for user_pk', async () => {
    const result = assertDefined(
      await usersService.create({
        ...validInput,
        user_email: uniqueEmail('create_uuid'),
      }),
    );
    testIds.push(result.user_pk);

    expect(result.user_pk).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it('should default user_role to client', async () => {
    const result = assertDefined(
      await usersService.create({
        ...validInput,
        user_email: uniqueEmail('create_role'),
      }),
    );
    testIds.push(result.user_pk);

    expect(result.user_role).toBe('client');
  });

  it('should not expose user_password in the returned user', async () => {
    const result = assertDefined(
      await usersService.create({
        ...validInput,
        user_email: uniqueEmail('create_nopwd'),
      }),
    );
    testIds.push(result.user_pk);

    expect(
      (result as unknown as Record<string, unknown>)['user_password'],
    ).toBeUndefined();
  });
});

describe('usersService.update', () => {
  it('should update and return the modified user', async () => {
    const created = assertDefined(
      await usersService.create({
        ...validInput,
        user_email: uniqueEmail('update'),
      }),
    );
    testIds.push(created.user_pk);

    const updated = assertDefined(
      await usersService.update(created.user_pk, {
        user_first_name: 'TEST_Updated',
      }),
    );

    expect(updated.user_first_name).toBe('TEST_Updated');
  });

  it('should leave unchanged fields the same', async () => {
    const created = assertDefined(
      await usersService.create({
        ...validInput,
        user_email: uniqueEmail('update_partial'),
      }),
    );
    testIds.push(created.user_pk);

    const updated = assertDefined(
      await usersService.update(created.user_pk, {
        user_first_name: 'TEST_Partial',
      }),
    );

    expect(updated.user_email).toBe(uniqueEmail('update_partial'));
    expect(updated.user_last_name).toBe('UserSvc');
  });

  it('should set user_updated_at after update', async () => {
    const created = assertDefined(
      await usersService.create({
        ...validInput,
        user_email: uniqueEmail('update_ts'),
      }),
    );
    testIds.push(created.user_pk);

    assertDefined(
      await usersService.update(created.user_pk, {
        user_first_name: 'TEST_Timestamp',
      }),
    );

    const row = assertDefined(
      (
        await db.select().from(users).where(eq(users.user_pk, created.user_pk))
      )[0],
    );
    expect(row.user_updated_at).toBeInstanceOf(Date);
  });

  it('should return undefined for non-existent ID', async () => {
    const result = await usersService.update(
      '00000000-0000-0000-0000-000000000000',
      { user_first_name: 'Nope' },
    );
    expect(result).toBeUndefined();
  });

  it('should not update a soft-deleted user', async () => {
    const created = assertDefined(
      await usersService.create({
        ...validInput,
        user_email: uniqueEmail('update_deleted'),
      }),
    );
    testIds.push(created.user_pk);
    await usersService.remove(created.user_pk);

    const result = await usersService.update(created.user_pk, {
      user_first_name: 'TEST_ShouldNotWork',
    });
    expect(result).toBeUndefined();
  });
});

describe('usersService.remove', () => {
  it('should soft-delete and return the user', async () => {
    const created = assertDefined(
      await usersService.create({
        ...validInput,
        user_email: uniqueEmail('remove'),
      }),
    );
    testIds.push(created.user_pk);

    const result = assertDefined(await usersService.remove(created.user_pk));

    expect(result.user_pk).toBe(created.user_pk);
  });

  it('should hide the user from list() after removal', async () => {
    const created = assertDefined(
      await usersService.create({
        ...validInput,
        user_email: uniqueEmail('remove_list'),
      }),
    );
    testIds.push(created.user_pk);
    await usersService.remove(created.user_pk);

    const list = await usersService.list();
    const found = list.find((u) => u.user_pk === created.user_pk);
    expect(found).toBeUndefined();
  });

  it('should return undefined for already-deleted user', async () => {
    const created = assertDefined(
      await usersService.create({
        ...validInput,
        user_email: uniqueEmail('remove_twice'),
      }),
    );
    testIds.push(created.user_pk);
    await usersService.remove(created.user_pk);

    const result = await usersService.remove(created.user_pk);
    expect(result).toBeUndefined();
  });

  it('should return undefined for non-existent ID', async () => {
    const result = await usersService.remove(
      '00000000-0000-0000-0000-000000000000',
    );
    expect(result).toBeUndefined();
  });
});
