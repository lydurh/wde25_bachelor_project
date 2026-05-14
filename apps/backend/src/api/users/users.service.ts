import type { User } from '@repo/shared';

const sampleUsers = [
  {
    id: '1',
    user_email: 'john.doe@example.co',
    user_first_name: 'John',
    user_last_name: 'Doe',
    user_location_fk: 'Guldbergsgade 29, 2200 København N',
    user_password: 'Password123!',
    user_role: 'client',
    user_deleted_at: null,
  },
  {
    id: '2',
    user_email: 'jane.smith@example.com',
    user_first_name: 'Jane',
    user_last_name: 'Smith',
    user_location_fk: 'Guldbergsgade 29, 2200 København N',
    user_password: 'Password123!',
    user_role: 'client',
    user_deleted_at: null,
  },
];

export const usersService = {
  list(): User[] {
    return sampleUsers.filter((user) => !user.user_deleted_at);
  },

  get(id: string): User | undefined {
    return sampleUsers.find(
      (user) => user.id === id && !user.user_deleted_at,
    );
  },

  update(
    id: string,
    data: {
      user_email?: string;
      user_first_name?: string;
      user_last_name?: string;
      user_location_fk?: string;
      user_password?: string;
      repeat_password?: string;
    },
  ): User | undefined {
    const user = sampleUsers.find((user) => user.id === id);

    if (!user) {
      return undefined;
    }

    if (data.user_email) {
      user.user_email = data.user_email;
    }

    if (data.user_first_name) {
      user.user_first_name = data.user_first_name;
    }

    if (data.user_last_name) {
      user.user_last_name = data.user_last_name;
    }

    if (data.user_location_fk) {
      user.user_location_fk = data.user_location_fk;
    }

    if (data.user_password) {
      user.user_password = data.user_password;
    }

    return user;
  },

  delete(id: string): User | undefined {
    const user = sampleUsers.find(
      (user) => user.id === id && !user.user_deleted_at,
    );

    if (!user) {
      return undefined;
    }

    user.user_deleted_at = new Date().toISOString();
    return user;
  },
};
