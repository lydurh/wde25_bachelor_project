import { describe, it, expect, afterAll } from 'bun:test';
import { sign } from 'hono/jwt';
import { app } from '../../app';
import { env } from '../../lib/env';
import { usersService } from '../../api/users/users.service';
import { db, users, like } from '@repo/db';
import type { User } from '@repo/shared';

type UserResponse = { data: User };
type UserListResponse = { data: User[] };

const testIds: string[] = [];

const assertDefined = <T>(val: T | undefined): T => {
  expect(val).toBeDefined();
  return val as T;
};

const uniqueEmail = (suffix: string) =>
  `TEST_users_handler_${suffix}@example.com`;

/** Valid UUID v4 for JWT tests (nil UUIDs fail uuidSchema). */
const ADMIN_TEST_USER_PK = 'a0000000-0000-4000-8000-000000000001';

const signAdminToken = async (): Promise<string> =>
  sign(
    {
      user_pk: ADMIN_TEST_USER_PK,
      user_role: 'admin',
      user_email: 'admin@test.com',
      exp: Math.floor(Date.now() / 1000) + 3600,
    },
    env.JWT_SECRET,
    'HS256',
  );

const adminAuthHeader = async (): Promise<{ Authorization: string }> => ({
  Authorization: `Bearer ${await signAdminToken()}`,
});

afterAll(async () => {
  for (const id of testIds) {
    await usersService.remove(id).catch(() => undefined);
  }
  await db.delete(users).where(like(users.user_email, 'TEST_%'));
});

const validCreateInput = {
  user_email: 'TEST_users_handler_create@example.com',
  user_first_name: 'TEST',
  user_last_name: 'HandlerUser',
  user_password: 'password123',
};

describe('GET /api/users', () => {
  it('should return 200 with auth token', async () => {
    const res = await app.request('/api/users', {
      headers: await adminAuthHeader(),
    });
    expect(res.status).toBe(200);
  });

  it('should return a data array', async () => {
    const res = await app.request('/api/users', {
      headers: await adminAuthHeader(),
    });
    const body = (await res.json()) as UserListResponse;
    expect(Array.isArray(body.data)).toBe(true);
  });

  it('should return 401 without auth token', async () => {
    const res = await app.request('/api/users');
    expect(res.status).toBe(401);
  });

  it('should return 403 when a client requests the user list', async () => {
    const created = assertDefined(
      await usersService.create({
        ...validCreateInput,
        user_email: uniqueEmail('list_forbidden'),
      }),
    );
    testIds.push(created.user_pk);

    const clientToken = await sign(
      {
        user_pk: created.user_pk,
        user_role: 'client',
        user_email: created.user_email,
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      env.JWT_SECRET,
      'HS256',
    );

    const res = await app.request('/api/users', {
      headers: { Authorization: `Bearer ${clientToken}` },
    });
    expect(res.status).toBe(403);
  });
});

describe('GET /api/users/search', () => {
  it('should return 200 with matching users for admin', async () => {
    const created = assertDefined(
      await usersService.create({
        ...validCreateInput,
        user_email: uniqueEmail('search_by_name'),
        user_first_name: 'TESTSearchFirst',
        user_last_name: 'TESTSearchLast',
      }),
    );
    testIds.push(created.user_pk);

    const res = await app.request('/api/users/search?name=TESTSearchFirst', {
      headers: await adminAuthHeader(),
    });
    const body = (await res.json()) as UserListResponse;

    expect(res.status).toBe(200);
    expect(body.data.some((u) => u.user_pk === created.user_pk)).toBe(true);
  });

  it('should return empty data when name query is empty', async () => {
    const res = await app.request('/api/users/search?name=', {
      headers: await adminAuthHeader(),
    });
    const body = (await res.json()) as UserListResponse;

    expect(res.status).toBe(200);
    expect(body.data).toEqual([]);
  });

  it('should return 401 without auth token', async () => {
    const res = await app.request('/api/users/search?name=TEST');
    expect(res.status).toBe(401);
  });

  it('should return 403 for non-admin', async () => {
    const created = assertDefined(
      await usersService.create({
        ...validCreateInput,
        user_email: uniqueEmail('search_forbidden'),
      }),
    );
    testIds.push(created.user_pk);

    const clientToken = await sign(
      {
        user_pk: created.user_pk,
        user_role: 'client',
        user_email: created.user_email,
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      env.JWT_SECRET,
      'HS256',
    );

    const res = await app.request('/api/users/search?name=TEST', {
      headers: { Authorization: `Bearer ${clientToken}` },
    });
    expect(res.status).toBe(403);
  });
});

describe('GET /api/users/:id', () => {
  it('should return 200 with a valid user', async () => {
    const created = assertDefined(
      await usersService.create({
        ...validCreateInput,
        user_email: uniqueEmail('get_by_id'),
      }),
    );
    testIds.push(created.user_pk);

    const res = await app.request(`/api/users/${created.user_pk}`, {
      headers: await adminAuthHeader(),
    });
    const body = (await res.json()) as UserResponse;

    expect(res.status).toBe(200);
    expect(body.data.user_pk).toBe(created.user_pk);
  });

  it('should return 404 for non-existent ID', async () => {
    const res = await app.request(
      '/api/users/00000000-0000-0000-0000-000000000000',
      { headers: await adminAuthHeader() },
    );
    expect(res.status).toBe(404);
  });

  it('should return 400 for invalid UUID format', async () => {
    const res = await app.request('/api/users/not-a-uuid', {
      headers: await adminAuthHeader(),
    });
    expect(res.status).toBe(400);
  });

  it('should return 401 without auth token', async () => {
    const created = assertDefined(
      await usersService.create({
        ...validCreateInput,
        user_email: uniqueEmail('get_no_auth'),
      }),
    );
    testIds.push(created.user_pk);

    const res = await app.request(`/api/users/${created.user_pk}`);
    expect(res.status).toBe(401);
  });
});

describe('POST /api/users', () => {
  it('should return 201 with valid input', async () => {
    const res = await app.request('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(await adminAuthHeader()),
      },
      body: JSON.stringify({
        ...validCreateInput,
        user_email: uniqueEmail('create'),
      }),
    });
    const body = (await res.json()) as UserResponse;
    testIds.push(body.data.user_pk);

    expect(res.status).toBe(201);
    expect(body.data.user_email).toBe(uniqueEmail('create'));
  });

  it('should return 400 with missing required fields', async () => {
    const res = await app.request('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(await adminAuthHeader()),
      },
      body: JSON.stringify({ user_first_name: 'TEST' }),
    });
    expect(res.status).toBe(400);
  });

  it('should return 400 with invalid email format', async () => {
    const res = await app.request('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(await adminAuthHeader()),
      },
      body: JSON.stringify({
        ...validCreateInput,
        user_email: 'not-an-email',
      }),
    });
    expect(res.status).toBe(400);
  });

  it('should return 400 with short password', async () => {
    const res = await app.request('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(await adminAuthHeader()),
      },
      body: JSON.stringify({
        ...validCreateInput,
        user_email: uniqueEmail('create_short_pwd'),
        user_password: 'short',
      }),
    });
    expect(res.status).toBe(400);
  });

  it('should return 401 without auth token', async () => {
    const res = await app.request('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...validCreateInput,
        user_email: uniqueEmail('create_no_auth'),
      }),
    });
    expect(res.status).toBe(401);
  });
});

describe('PATCH /api/users/:id', () => {
  it('should return 200 with a partial update', async () => {
    const created = assertDefined(
      await usersService.create({
        ...validCreateInput,
        user_email: uniqueEmail('patch'),
      }),
    );
    testIds.push(created.user_pk);

    const res = await app.request(`/api/users/${created.user_pk}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(await adminAuthHeader()),
      },
      body: JSON.stringify({ user_first_name: 'Patched' }),
    });
    const body = (await res.json()) as UserResponse;

    expect(res.status).toBe(200);
    expect(body.data.user_first_name).toBe('Patched');
  });

  it('should return 404 for non-existent ID', async () => {
    const res = await app.request(
      '/api/users/00000000-0000-0000-0000-000000000000',
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(await adminAuthHeader()),
        },
        body: JSON.stringify({ user_first_name: 'Nope' }),
      },
    );
    expect(res.status).toBe(404);
  });

  it('should return 400 with invalid email format', async () => {
    const created = assertDefined(
      await usersService.create({
        ...validCreateInput,
        user_email: uniqueEmail('patch_bad_email'),
      }),
    );
    testIds.push(created.user_pk);

    const res = await app.request(`/api/users/${created.user_pk}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(await adminAuthHeader()),
      },
      body: JSON.stringify({ user_email: 'not-an-email' }),
    });
    expect(res.status).toBe(400);
  });

  it('should return 401 without auth token', async () => {
    const created = assertDefined(
      await usersService.create({
        ...validCreateInput,
        user_email: uniqueEmail('patch_no_auth'),
      }),
    );
    testIds.push(created.user_pk);

    const res = await app.request(`/api/users/${created.user_pk}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_first_name: 'TEST_NoAuth' }),
    });
    expect(res.status).toBe(401);
  });

  it('should return 200 when a user updates their own profile', async () => {
    const created = assertDefined(
      await usersService.create({
        ...validCreateInput,
        user_email: uniqueEmail('patch_self'),
      }),
    );
    testIds.push(created.user_pk);

    const selfToken = await sign(
      {
        user_pk: created.user_pk,
        user_role: 'client',
        user_email: created.user_email,
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      env.JWT_SECRET,
      'HS256',
    );

    const res = await app.request(`/api/users/${created.user_pk}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${selfToken}`,
      },
      body: JSON.stringify({
        user_first_name: 'SelfPatched',
        user_email: uniqueEmail('patch_self_updated'),
      }),
    });
    const body = (await res.json()) as UserResponse;

    expect(res.status).toBe(200);
    expect(body.data.user_first_name).toBe('SelfPatched');
  });

  it('should return 403 when a non-admin tries to update another user', async () => {
    const target = assertDefined(
      await usersService.create({
        ...validCreateInput,
        user_email: uniqueEmail('patch_forbidden_target'),
      }),
    );
    testIds.push(target.user_pk);

    const otherUser = assertDefined(
      await usersService.create({
        ...validCreateInput,
        user_email: uniqueEmail('patch_forbidden_other'),
      }),
    );
    testIds.push(otherUser.user_pk);

    const otherToken = await sign(
      {
        user_pk: otherUser.user_pk,
        user_role: 'client',
        user_email: otherUser.user_email,
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      env.JWT_SECRET,
      'HS256',
    );

    const res = await app.request(`/api/users/${target.user_pk}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${otherToken}`,
      },
      body: JSON.stringify({ user_first_name: 'Hacked' }),
    });
    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/users/:id', () => {
  it('should return 200 on successful soft-delete (self)', async () => {
    const created = assertDefined(
      await usersService.create({
        ...validCreateInput,
        user_email: uniqueEmail('delete_self'),
      }),
    );
    testIds.push(created.user_pk);

    const selfToken = await sign(
      {
        user_pk: created.user_pk,
        user_role: 'client',
        user_email: created.user_email,
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      env.JWT_SECRET,
      'HS256',
    );

    const res = await app.request(`/api/users/${created.user_pk}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${selfToken}` },
    });
    expect(res.status).toBe(200);
  });

  it('should return 200 on successful soft-delete (admin)', async () => {
    const created = assertDefined(
      await usersService.create({
        ...validCreateInput,
        user_email: uniqueEmail('delete_admin'),
      }),
    );
    testIds.push(created.user_pk);

    const res = await app.request(`/api/users/${created.user_pk}`, {
      method: 'DELETE',
      headers: await adminAuthHeader(),
    });
    expect(res.status).toBe(200);
  });

  it('should hide the user from GET list after deletion', async () => {
    const created = assertDefined(
      await usersService.create({
        ...validCreateInput,
        user_email: uniqueEmail('delete_list'),
      }),
    );
    testIds.push(created.user_pk);

    await app.request(`/api/users/${created.user_pk}`, {
      method: 'DELETE',
      headers: await adminAuthHeader(),
    });

    const listRes = await app.request('/api/users', {
      headers: await adminAuthHeader(),
    });
    const listBody = (await listRes.json()) as UserListResponse;
    const found = listBody.data.find((u) => u.user_pk === created.user_pk);
    expect(found).toBeUndefined();
  });

  it('should return 403 when a non-admin tries to delete another user', async () => {
    const target = assertDefined(
      await usersService.create({
        ...validCreateInput,
        user_email: uniqueEmail('delete_forbidden_target'),
      }),
    );
    testIds.push(target.user_pk);

    const otherUser = assertDefined(
      await usersService.create({
        ...validCreateInput,
        user_email: uniqueEmail('delete_forbidden_other'),
      }),
    );
    testIds.push(otherUser.user_pk);

    const otherToken = await sign(
      {
        user_pk: otherUser.user_pk,
        user_role: 'client',
        user_email: otherUser.user_email,
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      env.JWT_SECRET,
      'HS256',
    );

    const res = await app.request(`/api/users/${target.user_pk}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${otherToken}` },
    });
    expect(res.status).toBe(403);
  });

  it('should return 404 for non-existent ID', async () => {
    const res = await app.request(
      '/api/users/00000000-0000-0000-0000-000000000000',
      {
        method: 'DELETE',
        headers: await adminAuthHeader(),
      },
    );
    expect(res.status).toBe(404);
  });

  it('should return 401 without auth token', async () => {
    const created = assertDefined(
      await usersService.create({
        ...validCreateInput,
        user_email: uniqueEmail('delete_no_auth'),
      }),
    );
    testIds.push(created.user_pk);

    const res = await app.request(`/api/users/${created.user_pk}`, {
      method: 'DELETE',
    });
    expect(res.status).toBe(401);
  });
});
