import type { User } from '@repo/shared';

type UserWithPassword = User & {
  password: string;
};

const users: UserWithPassword[] = [];

export const authService = {
  signup(first_name: string, last_name: string, email: string, password: string): User {
    const name = [first_name, last_name].filter(Boolean).join(' ').trim();
    const newUser: UserWithPassword = {
      id: crypto.randomUUID(),
      name,
      email,
      password,
    };

    users.push(newUser);

    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    };
  },

  login(email: string, password: string): User | null {
    const existingUser = users.find(
      (user) => user.email === email && user.password === password,
    );

    if (!existingUser) {
      return null;
    }

    return {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
    };
  },

  logout(): boolean {
    return true;
  },
};

