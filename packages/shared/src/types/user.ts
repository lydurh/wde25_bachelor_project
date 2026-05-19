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

/** Strip sensitive fields from a DB row before returning to the client. */
export function toPublicUser(row: UserRow): User {
  return {
    user_pk: row.user_pk,
    user_role: row.user_role,
    user_email: row.user_email,
    user_first_name: row.user_first_name,
    user_last_name: row.user_last_name,
    user_location_fk: row.user_location_fk,
    user_created_at: row.user_created_at,
    user_updated_at: row.user_updated_at,
  };
}
