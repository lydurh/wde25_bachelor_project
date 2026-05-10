import type { User } from '@repo/shared';

export const authService = {
  signup(first_name: string, last_name: string, email: string, password: string): User {
    return {
      id: crypto.randomUUID(),
      first_name,
      last_name,
      email,
    };
  },
};

