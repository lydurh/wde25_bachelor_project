import type { User } from '@repo/shared';



export const usersService = {
  list(): User[] {
    return sampleUsers.filter((user) => !user.user_deleted_at);
  },

  get(id: string): User | undefined {
    return sampleUsers.find((user) => user.id === id && !user.user_deleted_at);
  },

  update(
    id: string,
    data: {
      user_email?: string | undefined;
      user_first_name?: string | undefined;
      user_last_name?: string | undefined;
      user_location_fk?: string | undefined;
      user_password?: string | undefined;
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
