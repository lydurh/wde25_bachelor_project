/** JWT payload shape issued by the auth service on login. */
export type JwtPayload = {
  /** User primary key (UUID). */
  sub: string;
  /** User role, e.g. 'client' | 'admin'. */
  role: string;
  /** Expiry — seconds since Unix epoch. */
  exp: number;
};
