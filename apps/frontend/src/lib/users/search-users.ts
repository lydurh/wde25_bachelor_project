import type { User } from '@repo/shared';

import { api } from '@/lib/api';

export async function searchUsersByName(
  name: string,
  signal?: AbortSignal,
): Promise<User[]> {
  const trimmed = name.trim();
  if (!trimmed) {
    return [];
  }

  const { data } = await api.get<{ data: User[] }>(
    `/users/search?name=${encodeURIComponent(trimmed)}`,
    signal ? { signal } : undefined,
  );

  return data;
}
