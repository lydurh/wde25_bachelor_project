import type { User } from '@repo/shared';

type UserWithPassword = User & {
  password: string;
  verified: boolean;
};

const users: UserWithPassword[] = [];
const verificationTokens = new Map<string, string>();

export const authService = {
  signup(
    first_name: string,
    last_name: string,
    email: string,
    password: string,
  ): { user: User; token: string } {
    const name = [first_name, last_name].filter(Boolean).join(' ').trim();
    const newUser: UserWithPassword = {
      id: crypto.randomUUID(),
      name,
      email,
      password,
      verified: false,
    };

    users.push(newUser);

    const token = crypto.randomUUID();
    verificationTokens.set(token, newUser.id);

    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
      token,
    };
  },

  login(email: string, password: string): User | null {
    const existingUser = users.find(
      (user) =>
        user.email === email &&
        user.password === password &&
        user.verified,
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

  verifyEmail(token: string): User | null {
    const userId = verificationTokens.get(token);

    if (!userId) {
      return null;
    }

    const existingUser = users.find((user) => user.id === userId);

    if (!existingUser) {
      return null;
    }

    existingUser.verified = true;
    verificationTokens.delete(token);

    return {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
    };
  },
};

