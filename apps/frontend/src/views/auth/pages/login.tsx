import { useState } from 'react';
import { useNavigate } from 'react-router';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import type { User } from '@/types';

type LoginResponse = { data: { token: string; user: User } };

export const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await api.post<LoginResponse>('/auth/login', {
        email,
        password,
      });

      auth.setToken(res.data.token);

      // Redirect based on role
      if (auth.isAdmin()) {
        void navigate('/admin');
      } else {
        void navigate('/dashboard');
      }
    } catch {
      setError('Invalid email or password');
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-10 bg-background">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-border p-6">
        <h1 className="text-3xl font-semibold text-center mb-6">Login</h1>

        {error && (
          <p className="text-sm text-destructive text-center mb-4">{error}</p>
        )}

        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-input bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-input bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <a
              href="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </a>
          </div>
          <button
            type="submit"
            className="mt-2 rounded-lg bg-black px-4 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Login
          </button>
        </form>
      </div>
    </section>
  );
};
