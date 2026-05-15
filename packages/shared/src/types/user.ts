/** Full DB row shape (mirrors the `users` table exactly) */
export type UserRow = {
  user_pk: string;
  user_role: string;
  user_email: string;
  user_first_name: string;
  user_last_name: string;
  user_location_fk: string | null;
  user_password: string;
  user_note: string | null;
  user_created_at: Date;
  user_updated_at: Date | null;
  user_deleted_at: Date | null;
  user_verified_at: Date | null;
};

/** Public API response type (no sensitive fields) */
export type User = {
  user_pk: string;
  user_role: string;
  user_email: string;
  user_first_name: string;
  user_last_name: string;
  user_location_fk: string | null;
  user_created_at: Date;
  user_updated_at: Date | null;
};
