export type User = {
  id: string;
  user_email: string;
  name: string;
  email: string;
  user_first_name: string;
  user_last_name: string;
  user_location_fk?: string;
  user_password: string;
  user_role: string;
  user_deleted_at?: string | null;
};
