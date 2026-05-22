import { jwtPayloadSchema, type JwtPayload } from '@repo/shared';

export const auth = {
  getToken(): string | null {
    return localStorage.getItem('token');
  },

  setToken(token: string): void {
    localStorage.setItem('token', token);
  },

  clearToken(): void {
    localStorage.removeItem('token');
  },

  getPayload(): JwtPayload | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const base64 = token.split('.')[1];
      if (!base64) return null;
      const json = atob(base64);
      const parsed: unknown = JSON.parse(json);
      const result = jwtPayloadSchema.safeParse(parsed);
      if (!result.success) return null;
      return result.data;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    const payload = this.getPayload();
    if (!payload) return false;
    return payload.exp * 1000 > Date.now();
  },

  isAdmin(): boolean {
    const payload = this.getPayload();
    if (!payload) return false;
    if (payload.exp * 1000 < Date.now()) return false;
    return payload.user_role === 'admin';
  },

  getUserId(): string | null {
    return this.getPayload()?.user_pk ?? null;
  },

  getUserEmail(): string | null {
    return this.getPayload()?.user_email ?? null;
  },
};
