import type { User } from '@repo/shared';

const sampleUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.co',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
  },
];

export const usersService = {
  list(): User[] {
    return sampleUsers;
  },

  get(id: string): User | undefined {
    return sampleUsers.find((user) => user.id === id);
  },
};
